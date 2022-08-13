const Events = require('events');
const { join } = require('path');
const { existsSync } = require('fs');
const { head } = require('hfd/http');

const TIMEOUT = 10e3;

class Updatable extends Events {
  constructor (basePath, entityID, updateIdentifier) {
    super();

    this.basePath = basePath;
    if (!this.entityID) {
      this.entityID = entityID;
    }

    this.entityID = join(this.basePath, this.entityID);

    if (!updateIdentifier) {
      updateIdentifier = `${this.basePath.split(/[\\/]/).pop()}_${this.entityID}`;
    }

    this.updateIdentifier = updateIdentifier;

    this.__migrateIfNecessary();
  }

  isUpdatable () {
    return existsSync(join(this.basePath, this.entityID, '.git')) && !this.__shortCircuit;
  }

  async _checkForUpdates () {
    try {
      const gitStatus = await HfdNative.exec('git status -uno', {
        cwd: this.entityPath,
        timeout: TIMEOUT
      }).then(({ stdout }) => stdout.toString());

      return gitStatus.includes('git pull');
    } catch (e) {
      return false;
    }
  }

  async _getUpdateCommits () {
    const branch = await this.getBranch();
    const commits = [];

    const gitLog = await HfdNative.exec(`git log --format="%H -- %an -- %s" ..origin/${branch}`, {
      cwd: this.entityPath,
      timeout: TIMEOUT
    }).then(({ stdout }) => stdout.toString());

    const lines = gitLog.split('\n');
    lines.pop();
    lines.forEach((line) => {
      const data = line.split(' -- ');
      commits.push({
        id: data.shift(),
        author: data.shift(),
        message: data.shift()
      });
    });

    return commits;
  }

  async _update (force = false) {
    try {
      let command = 'git pull --ff-only';
      if (force) {
        const branch = await this.getBranch();
        command = `git reset --hard origin/${branch}`;
      }

      await HfdNative.exec(command, { cwd: this.entityPath }).then(({ stdout }) => stdout.toString());
      return true;
    } catch (e) {
      return false;
    }
  }

  async getGitRepo () {
    try {
      return await HfdNative.exec('git remote get-url origin', {
        cwd: this.entityPath,
        timeout: TIMEOUT
      }).then((r) => r.stdout.toString().match(/github\.com[:/]([\w-_]+\/[\w-_]+)/)[1]);
    } catch (e) {
      console.warn('Failed to fetch git origin url; ignoring');
      return null;
    }
  }

  getBranch () {
    return HfdNative.exec('git branch', {
      cwd: this.entityPath,
      timeout: TIMEOUT
    }).then(({ stdout }) => stdout.toString().split('\n').find(l => l.startsWith('*')).slice(2).trim());
  }

  async __migrateIfNecessary () {
    if (!this.isUpdatable()) {
      return;
    }

    const repo = await this.getGitRepo();
    if (!repo) {
      return;
    }

    const url = `https://github.com/${repo}`;
    const newUrl = await this.__followRedirects(url);

    if (!newUrl) {
      this.__shortCircuit = true;
    } else if (url !== newUrl) {
      console.debug('[Updater] Migrating to %s to repository %s', this.entityID, newUrl);
      await HfdNative.exec(`git remote set-url origin "${newUrl}`, { cwd: this.entityPath });
    }
  }

  async __followRedirects (url) {
    let code = -1;

    do {
      try {
        const res = await head(url);
        code = res.statusCode;
        if (code === 301 || code === 302) {
          url = res.headers.location;
        }
      } catch (e) {
        return false;
      }
    } while (code === 301 || code === 302);
    return url;
  }
}

module.exports = Updatable;
