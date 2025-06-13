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
    - `Name`: Unique identifier of the theme.
    - `DisplayName`: Theme name displayed in the web applications
    - `Class`: CSS class ID used for the theme (such as `eui-light-theme` in the default)
    - `Urls`: List of all relevant files for this theme (including images, icons, or other resources that are referenced if required)
    
    TIP: You can define multiple themes in this file. However, each theme still requires its own ZIP file.

    Important: the value used as `Name` should be the same as the first folder stored in the `Urls` e.g. `Name` == `company-name`  --> `Urls` == `../company-name/custom-theme.css` or any other additional reference to a resource.

   ```json
    {
        "Themes": [
            {
                "Name": "company-theme",
                "DisplayName": "Company Theme",
                "Class": "company-theme",
                "Urls": [
                    "../company-theme/custom-theme.css"
                ]
            },
            {
                "Name": "dark-company-theme",
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


Important: 

The `Name` used for `Themes` in the `imx-theme-config.json` are used the find the corresponding Html_<ThemeName>.zip files.

Example 1: If `Name` == `my-theme`, the ApiServer will load the file `Html_my-theme.zip` which will be decompressed to the webcache\html folder into a subfolder `my-theme` (`webcache\html\my-theme`). `Urls` should be `../my-theme/custom-theme.css`

Example 2: If `Name` == `MyTheme`, the ApiServer will load the file `Html_MyTheme.zip` which will be decompressed to the webcache\html folder into a subfolder `MyTheme` (`webcache\html\MyTheme`). `Urls` should be `../MyTheme/custom-theme.css`
