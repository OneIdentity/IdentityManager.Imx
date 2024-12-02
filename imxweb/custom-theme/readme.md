# Theming the application
The web applications support the integration of custom themes. For more detailed information about themes, see the [Angular Material Theming Guide](https://material.angular.io/guide/theming).

## Compiling a custom theme
To compile a custom theme, perform the following steps:
1. Open the [custom-theme.scss](./custom-theme.scss) file.
1. Make your changes to the [custom-theme.scss](./custom-theme.scss) file.
1. Change the name of the `$theme-name` variable to the corresponding name of your custom theme (for example, `$theme-name: 'company-theme'`).
1. Save the file.
1. In the `imxweb/custom-theme` folder, open a command line program.
1. On the command line, run the command `npm run build`.
1. Add the `custom-theme.css` file to a new ZIP file with the name `Html_<ThemeName>.zip`. Replace `<ThemeName>` with the corresponding name of the theme.
1. Copy the ZIP file to the `bin\imxweb` subfolder of your IIS installation.
1. In the `bin\imxweb` folder, create a new folder with the name `Html_<ThemeName>`. Replace `<ThemeName>` with the corresponding name of the theme.
1. In the newly created folder, create a new JSON file with the name `imx-theme-config.json` and the following parameters:
    - `Name`: Unique identifier of the theme
    - `DisplayName`: Theme name displayed in the web applications
    - `Class`: CSS class ID used for the theme (such as `eui-light-theme` in the default)
    - `Urls`: List of all relevant files for this theme (including images, icons, or other resources that are referenced if required) \
    TIP: You can define multiple themes in this file. However, each theme still requires its own ZIP file.
    ```json
    {
        "Themes": [
            {
                "Name": "CompanyTheme",
                "DisplayName": "Company Theme",
                "Class": "company-theme",
                "Urls": [
                    "../company-theme/custom-theme.css"
                ]
            },
            {
                "Name": "DarkCompanyTheme",
                "DisplayName": "Dark Company Theme",
                "Class": "dark-company-theme",
                "Urls": [
                    "../dark-company-theme/custom-theme.css"
                ]
            }
        ]
    }
    ```
1. Import the ZIP file and the `imx-theme-config.json` file into your One Identity Manager database using the Software Loader.
1. Restart your API Server.