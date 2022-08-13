const { getModule } = require('hfd/webpack');

module.exports = async function () {
  const Analytics = await getModule([ 'getSuperPropertiesBase64' ]);
  const Reporter = await getModule([ 'submitLiveCrashReport' ]);
  const AnalyticsMaker = await getModule([ 'analyticsTrackingStoreMaker' ]);

  const oldTrack = Analytics.track;
  const oldSubmitLiveCrashReport = Reporter.submitLiveCrashReport;
  const oldAddBreadcrumb = window.__SENTRY__.hub.addBreadcrumb;
  const oldHandleTrack = AnalyticsMaker.AnalyticsActionHandlers.handleTrack;

  Analytics.track = () => void 0;
  Reporter.submitLiveCrashReport = () => void 0;
  AnalyticsMaker.AnalyticsActionHandlers.handleTrack = () => void 0;
  window.__SENTRY__.hub.addBreadcrumb = () => void 0;

  window.__SENTRY__.hub.getClient().close();
  window.__SENTRY__.hub.getScope().clear();

  console.log('[HFD | NoTrack] Loaded.');

  return () => {
    Analytics.track = oldTrack;
    Reporter.submitLiveCrashReport = oldSubmitLiveCrashReport;
    window.__SENTRY__.hub.addBreadcrumb = oldAddBreadcrumb;
    AnalyticsMaker.AnalyticsActionHandlers.handleTrack = oldHandleTrack;
  };
};
