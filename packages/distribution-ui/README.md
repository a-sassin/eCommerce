In order to make customization work properly we will have to follow following coding guidelines:
1. If you are working on a component which has customizable labels or text color or background color save their values in following json format in the client-config.json file. You can use the existing customization UI as well to modify the json file.
JSON format - 
    nav: {

        "color": "#000",                            -- color of labels and text present inside the component
        "backgroundColor": "#f5f5f5",               -- background color of the component
        "selector": ".form-container",              -- classnames on which you want to apply the styles
        "updateISV": true                           -- This should be true if the component is present on ISV page as well
        //Child element configuration eg. (button, input)
    }
2. Avoid using angular component level css, reuse the classes present in the default.css file present on the node server.
3. To display a notification use NotificationService send method after receiving a success responsne from backend.
4. Avoid feeding all css/styling properties through ngStyle attribute since it creates inline style which are hard to override by an external medium like an external css file. Use it only specifying color and backgroundColor that too if the element is customizable.
5. configService will have all the configuration prerequisites required to function the consumer application, and that should the single point of reference to fetch all configurable data. Including, tenant-configuration, customization, ISV labels and tokens etc.