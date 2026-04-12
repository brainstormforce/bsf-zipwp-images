# ZipWP Images

Free images library for WordPress that integrates stock photo providers into the media library.

## External Services

This library connects to the following external services:

### ipify

- **Service URL:** https://api.ipify.org
- **Purpose:** Retrieves the server's public IP address for geolocation detection.
- **When data is sent:** On first load (result is cached for 1 week via WordPress transient).
- **Data transmitted:** Standard HTTP request (no personal data).
- **Terms of Use:** https://www.ipify.org/
- **Privacy Policy:** https://www.ipify.org/

### ipinfo.io

- **Service URL:** https://ipinfo.io/
- **Purpose:** Determines the server's country code based on its public IP address. This is used to select the appropriate image engines (e.g., Unsplash-only for regions where Pexels is unavailable).
- **When data is sent:** On first load when the `ipinfo` provider is selected (result is cached for 1 week via WordPress transient).
- **Data transmitted:** Server's public IP address.
- **Privacy Policy:** https://ipinfo.io/privacy-policy
- **Terms of Use:** https://ipinfo.io/terms-of-service

### ipwhois (Default Provider)

- **Service URL:** https://ipwho.is/
- **Purpose:** Default geolocation provider to determine the server's country code.
- **When data is sent:** On first load (result is cached for 1 week via WordPress transient).
- **Data transmitted:** Server's public IP address.

### ipapi

- **Service URL:** https://ipapi.co/
- **Purpose:** Alternative geolocation provider to determine the server's country code.
- **When data is sent:** On first load when the `ipapi` provider is selected (result is cached for 1 week via WordPress transient).
- **Data transmitted:** Server's public IP address.

### ZipWP API

- **Service URL:** https://api.zipwp.com/api/
- **Purpose:** Proxy for fetching images from stock photo providers (Pexels, Pixabay, Unsplash).
- **When data is sent:** When a user searches for or browses images in the media library.
- **Data transmitted:** Search query, image engine, color filter, orientation, page number.
- **Privacy Policy:** https://zipwp.com/privacy-policy/
- **Terms of Use:** https://zipwp.com/terms-of-use/

### Unsplash

- **Service URL:** https://unsplash.com/
- **Purpose:** One of the stock photo providers integrated via the ZipWP API. Images hosted on unsplash.com are downloaded to the local media library when a user selects an Unsplash image for import.
- **When data is sent:** When a user selects and imports an Unsplash image into the WordPress media library.
- **Data transmitted:** Image download request (image URL from unsplash.com).
- **Terms of Use:** https://unsplash.com/terms
- **Privacy Policy:** https://unsplash.com/privacy
