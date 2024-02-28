import { v4 as uuidv4 } from "uuid";

export const activeLicenseKey = async (licenseKey) => {
  const apiUrl = "https://api.lemonsqueezy.com/v1/licenses/activate";
  try {
    const body = new URLSearchParams({
      license_key: licenseKey,
      instance_name: uuidv4(),
    });
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: body,
    });
    const data = await response.json();

    if (data.activated) {
      return { isActivated: true };
    } else {
      return { isActivated: false, error: data.error };
    }
  } catch (error) {
    return { isActivated: false };
  }
};
