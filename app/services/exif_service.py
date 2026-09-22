import io
import hashlib
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ExifTags

def _convert_to_degrees(value) -> Optional[float]:
    """Helper function to convert the GPS coordinates stored in the EXIF to decimal degrees."""
    try:
        if isinstance(value, tuple) or isinstance(value, list):
            d = float(value[0])
            m = float(value[1])
            s = float(value[2])
            return d + (m / 60.0) + (s / 3600.0)
        elif hasattr(value, 'numerator') and hasattr(value, 'denominator'):
            return float(value.numerator) / float(value.denominator)
        elif isinstance(value, (int, float)):
            return float(value)
    except Exception:
        return None
    return None

def compute_image_hash(image_bytes: bytes) -> str:
    """Computes a lightweight 64-bit difference perceptual hash (dHash) and MD5 fallback."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata())
        difference = []
        for row in range(8):
            for col in range(8):
                pixel_left = pixels[row * 9 + col]
                pixel_right = pixels[row * 9 + col + 1]
                difference.append(pixel_left > pixel_right)
        decimal_value = 0
        hex_string = []
        for index, value in enumerate(difference):
            if value:
                decimal_value += 2 ** (index % 4)
            if (index % 4) == 3:
                hex_string.append(hex(decimal_value)[2:])
                decimal_value = 0
        return "".join(hex_string)
    except Exception:
        # Fallback to MD5 hex
        return hashlib.md5(image_bytes).hexdigest()

def extract_exif_gps(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts GPS latitude and longitude from photo EXIF metadata.
    Returns:
        {
            "latitude": float or None,
            "longitude": float or None,
            "source": "PHOTO_EXIF" or None,
            "image_hash": str or None
        }
    """
    image_hash = compute_image_hash(image_bytes)
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        exif_data = image._getexif()
        
        if not exif_data:
            return {
                "latitude": None,
                "longitude": None,
                "source": None,
                "image_hash": image_hash
            }

        gps_info = {}
        for tag, value in exif_data.items():
            decoded = ExifTags.TAGS.get(tag, tag)
            if decoded == "GPSInfo":
                for t in value:
                    sub_decoded = ExifTags.GPSTAGS.get(t, t)
                    gps_info[sub_decoded] = value[t]

        if not gps_info:
            return {
                "latitude": None,
                "longitude": None,
                "source": None,
                "image_hash": image_hash
            }

        gps_latitude = gps_info.get("GPSLatitude")
        gps_latitude_ref = gps_info.get("GPSLatitudeRef")
        gps_longitude = gps_info.get("GPSLongitude")
        gps_longitude_ref = gps_info.get("GPSLongitudeRef")

        if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
            lat = _convert_to_degrees(gps_latitude)
            lng = _convert_to_degrees(gps_longitude)

            if lat is not None and lng is not None:
                if str(gps_latitude_ref).upper() != "N":
                    lat = -lat
                if str(gps_longitude_ref).upper() != "E":
                    lng = -lng

                return {
                    "latitude": round(lat, 6),
                    "longitude": round(lng, 6),
                    "source": "PHOTO_EXIF",
                    "image_hash": image_hash
                }

    except Exception:
        pass

    return {
        "latitude": None,
        "longitude": None,
        "source": None,
        "image_hash": image_hash
    }

def resolve_location(
    exif_lat: Optional[float],
    exif_lng: Optional[float],
    device_lat: Optional[float],
    device_lng: Optional[float],
    address: Optional[str] = None
) -> Tuple[Optional[float], Optional[float], str]:
    """
    Resolves location based on strict priority:
    1. PHOTO_EXIF
    2. DEVICE_GPS
    3. MANUAL
    """
    if exif_lat is not None and exif_lng is not None:
        return exif_lat, exif_lng, "PHOTO_EXIF"
    elif device_lat is not None and device_lng is not None:
        return device_lat, device_lng, "DEVICE_GPS"
    else:
        return None, None, "MANUAL"
