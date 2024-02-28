export const validateLicenseKey = async (licenseKey) => {
  const apiUrl = "https://api.lemonsqueezy.com/v1/licenses/validate";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `license_key=${licenseKey}`,
    });
    const data = await response.json();

    if (data.valid) {
      const storeId = "YOUR_STORE_ID"; //replace with your store id
      if (
        data.meta.store_id == storeId &&
        data.license_key.activation_usage == 1
      ) {
        return { isValid: true };
      } else {
        return { isValid: false };
      }
    } else {
      return { isValid: false };
    }
  } catch (error) {
    return { isValid: false };
  }
};
