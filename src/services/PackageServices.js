import apiClient from "./services";

export default {
  createPackage(packageBody) {
    return apiClient.post("package/create", packageBody);
  },
  getAllPackages() {
    return apiClient.get("package/all");
  },
  getUserPackages(userId) {
    return apiClient.get(`package/all?userId=${userId}`);
  },
  deletePackage(id) {
    return apiClient.delete(`package/${id}`);
  },
  getPackageById(id) {
    return apiClient.get(`package/${id}`);
  },
  editPackage(id, updatedPackageBody) {
    return apiClient.put(`package/${id}`, updatedPackageBody);
  },
  enrollPackage(enrollData) {
    const { isEnrolled, ...body } = enrollData;
    return apiClient.post(`users/enroll?enroll=${isEnrolled}`, body);
  },
  getUserEnrolledPackages(userId) {
    return apiClient.get(`users/enrolled/${userId}`);
  },
};
