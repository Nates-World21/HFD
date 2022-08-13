# HFD (HalfwayDecentMod)
A stupid mod that i actually enjoy using.

## Installation
```
git pull https://github.com/LandenStephenss/HFD
cd HFD
npm run inject
```
After running these commands you are going to have to completely kill discord and reopen it.
The default injection is pointed towards stable, although you can inject into another discord branch with the following `npm run inject <canary | ptb | dev>`

## Plugins
Plugins are not yet supported.

## Creating a theme
First you'll need a manifest, a simple one can look like this:
```json
    {
        "name": "One Dark+",
        "description": "Discord but dark",
        "version": "2.23.6",
        "author": "Aetheryx",
        "theme": "main.css"
    }
```
After creating your manifest you'll have to create the `main.css` file (or whatever file you gave it in the manifest). Keep in mind SCSS is supported so if you'd like to use that you can.

### Advanced Theme Manifest
```js
{
    name: "superEpicTheme", // Theme name
    description: "this theme is not so epic", // Theme description
    version: "69.69.69", // Theme version
    author: "notOlykir", // Theme author
    theme: "theme.scss", // Theme file
    plugins: [ // Theme plugins
        {
            name: "epicThemePlugin", // Name of theme plugin
            description: "plugin that does stuff", // Description of theme plugin
            author: "olykir", // Author of theme plugin
            license: "totallyMit", // License of theme plugin
            file: "plugin.scss", // theme plugin license
            settings: { // Settings for theme plugin
                format: "css", // Format of settings, see below
                options: [] // options for settings, see all options below
            }
        }
    ],
    settings: { // Theme settings
        format: "css", // Format for the settings, use css or scss
        options: [
            {
                name: "Discord Title", // Settings name
                variable: "--watermark-title", // Variable in (s)css to change
                description: "Change the discord title", // Description of the setting
                type: "string" // Type of setting
            },
            {
                name: "Server list",
                variable: "--server-list-direction",
                description: "Change the server list direction",
                type: "select",
                options: [ // Options for select, specific to this type
                    {
                        label: "Horizontal", // Label for the dropdown
                        value: "horizontal" // Value to set when picked
                    },
                    {
                        label: "Vertical",
                        value: "vertical"
                    }
                ]
            },
            {
                name: "Max channel name length",
                variable: "UsernameLen",
                description: "Change how long channel names display",
                type: "number",
                markers: [ // Specific to number, could also use limit, see below
                    2, // These must be numbers
                    6, // Markers will be on a slider
                    10,
                    14,
                    18,
                    22,
                    26
                ]
            },
            {
                name: "Max channel name length",
                variable: "ChannelLen",
                description: "Change how long channel names display",
                type: "number",
                limit: [ // Specific to number
                    2, // Minimum number
                    20 // Maximum number
                ]
            },
            {
                name: "text color",
                variable: "TextColor",
                description: "change the text color",
                type: "color" // Will show a color picker
            },
            {
                name: "background color",
                variable: "BackgroundColor",
                description: "change the background color",
                type: "color_alpha" // Will show a color picker
            },
            {
                name: "Olykirs new profile picture",
                variable: "OlykirPFP",
                description: "change olykirs profile picture",
                type: "url" // will show a text input
            },
            {
                name: "Background image",
                variable: "ChatBackground",
                description: "Change the background image",
                type: "background" // will show a text input
            },
            {
                name: "Font",
                variable: "Font",
                description: "Change the font",
                type: "font" // will show a text input
            }
        ]
    }
}
```