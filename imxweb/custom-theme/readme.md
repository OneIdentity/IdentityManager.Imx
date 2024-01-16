# Theming the application

The HTML5 applications support the integration of **custom themes**. Before proceeding, we recommend that you read the [Angular Material Theming](https://material.angular.io/guide/theming) guide.

## Compiling a custom theme

- Change the variables in the file [custom-theme.scss](./custom-theme.scss) as required:
  - `$font-family`
  - `$primary`
  - `$accent`
  - `$warn`
- Rename the `.custom-theme` class to your theme's name. (e.g. `.space-theme`)
- In a terminal, change to the `imxweb/custom-theme` folder and run the `npm run build` command
- Take the `custom-theme.css` file and create a .zip file. The naming convention is to use `Html_<ThemeName>.zip` (for example `Html_space-theme.zip`).
- Copy the .zip file to the `imxweb` folder.
- Create a folder inside the `imxweb` folder with the name of your .zip file (e.g. `Html_space-theme`).
- Create a `imx-theme-config.json` file inside in this folder. Use this text as a content template, filling in the correct values for your theme.
  - `Name`: a unique name and identifier of the theme
  - `DisplayName`: a user friendly name for display purposes
  - `Class`: the CSS class identifier which is used for theming (e.g. `eui-light-theme` in default)
  - `Urls`: a list of all relevant files for this theme (also pictures, icons or other resources which are referenced if required)

```json
{
  "Themes": [
    {
      "Name": "space-theme",
      "DisplayName": "Space Theme",
      "Class": "space-theme",
      "Urls": ["../space-theme/custom-theme.css"]
    }
  ]
}
```

- Upload the .zip file and the `imx-theme-config.json` file with Software Loader like you would with an Angular plugin.
- Restart your API server.
- Login to Web Portal > Click on your username > Select "User Interface Settings" > Change the application's theme to your custom theme.

_Note_: Multiple theme definition files are possible. Multiple themes can also be declared inside one theme `imx-theme-config.json` file, however every theme needs to be provided as single .zip file.
