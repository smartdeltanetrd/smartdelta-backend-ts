// provider independent methods can be moved to this class and can be used by different classes.
export default class SharedMethodUtility {
    static convertKubeConfigToJson() {
        console.log("This method is shared among different classes.");
    }
}
