import apiClient from "./services";

export default {
  createPackage(packageBody) {
    return apiClient.post("package/create", packageBody);
  },
  getAllPackages() {
    return apiClient.get("package/all");
  },
  deletePackage(id) {
    return apiClient.delete(`package/${id}`);
  },
};
