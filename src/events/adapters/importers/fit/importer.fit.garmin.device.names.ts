/*
To update this list:
- Download fit sdk here: https://developer.garmin.com/fit/download/
- Run below python tool script on "c/fit_example.h" file to extract most of new devices
- Then rework the list manually with a git diff
--------------
import re


def list_garmin_products(header_file):
    black_list = ["AXB0", "HRM", "LEGACY", "VARIA", "VECTOR", "DSI_ALF"]
    replace_words_blank = ["CHN", "JPN", "SEA", "KOR", "EA", "CHINA", "JAPAN", "TAIWAN", "KOREA", "ASIA", "RUSSIA",
                           "TWN", "OLED", "THAI", "HEBREW", "SMALL", "LARGE", "OLD", "APAC", "WIN", "MAC", "ANDROID",
                           "IOS", "DAIMLER"]
    pre_replace_words_map = {
        "JR": "JUNIOR",
        "FR": "FORERUNNER",
        "D2AIRVENU": "D2 AIR",
        "VENU(\w+)": r"VENU \1",
        "VIRB(\w+)": r"VIRB \1",
    }

    post_replace_words_map = {
        "Vivo Fit": "VivoFit",
        "Vivo Smart": "VivoSmart",
        "Vivo Active": "VivoActive",
        "Vivoactive": "VivoActive",
        "Vivo Move": "VivoMove",
        "Vivo Sport": "VivoSport",
        "Vivo KI": "VivoKi",
    }

    garmin_sdk_data = open(header_file, "r").readlines()
    results = dict()
    for line in garmin_sdk_data:
        product_search = re.search("^#define FIT_GARMIN_PRODUCT_(\w*).*\(\(FIT_GARMIN_PRODUCT\)(\d+)\)$", line)
        if product_search:
            name = product_search.groups()[0]
            product_id = product_search.groups()[1]

            # Don't keep if not matching
            is_matching_black_list = any(ele in name for ele in black_list)
            if not is_matching_black_list:
                # Remove unwanted words in product name
                for word in replace_words_blank:
                    name = name.replace(word, "")

                # Add spaces after product names with version
                name = re.sub(r"([a-zA-Z][a-zA-Z]+)(\d+)", r"\1 \2", name)

                # Pre-replace words by others when matching
                for src, target in pre_replace_words_map.items():
                    name = re.sub(src, target, name)

                # Cleaning
                name = name.replace("_", " ")
                name = name.replace("  ", " ")
                name = name.strip()
                name = name.lower()
                name_arr = []

                for word in name.split(" "):
                    # First capitalize every words
                    word = word.capitalize()

                    # If word start with number then upper case word or size if 2-3 length
                    if re.match(r"^[0-9]+.*", word) or re.match(r"^\w{2}$", word):
                        word = word.upper()

                    name_arr.append(word)

                name = " ".join(name_arr)

                # Post-replace words by others when matching
                for src, target in post_replace_words_map.items():
                    name = re.sub(src, target, name)

                results[product_id] = "Garmin {}".format(name)
    return results


def main():
    products = list_garmin_products("fit_example.h")

    for pid, pname in products.items():
        print("{}: '{}',".format(pid, pname))


if __name__ == '__main__':
    main()

--------------
 */

export const ImporterFitGarminDeviceNames: { [index: number]: string } = {
  473: 'Garmin Forerunner 301',
  474: 'Garmin Forerunner 301',
  475: 'Garmin Forerunner 301',
  494: 'Garmin Forerunner 301',
  717: 'Garmin Forerunner 405',
  782: 'Garmin Forerunner 50',
  987: 'Garmin Forerunner 405',
  988: 'Garmin Forerunner 60',
  1018: 'Garmin Forerunner 310XT',
  1036: 'Garmin Edge 500',
  1124: 'Garmin Forerunner 110',
  1169: 'Garmin Edge 800',
  1199: 'Garmin Edge 500',
  1213: 'Garmin Edge 500',
  1253: 'Garmin Chirp',
  1274: 'Garmin Forerunner 110',
  1325: 'Garmin Edge 200',
  1328: 'Garmin Forerunner 910XT',
  1333: 'Garmin Edge 800',
  1334: 'Garmin Edge 800',
  1345: 'Garmin Forerunner 610',
  1360: 'Garmin Forerunner 210',
  1386: 'Garmin Edge 800',
  1387: 'Garmin Edge 500',
  1405: 'Garmin Approach G10',
  1410: 'Garmin Forerunner 610',
  1422: 'Garmin Edge 500',
  1436: 'Garmin Forerunner 70',
  1446: 'Garmin Forerunner 310XT 4T',
  1461: 'Garmin Amx',
  1482: 'Garmin Forerunner 10',
  1497: 'Garmin Edge 800',
  1499: 'Garmin Swim',
  1537: 'Garmin Forerunner 910XT',
  1551: 'Garmin Fenix',
  1555: 'Garmin Edge 200',
  1561: 'Garmin Edge 510',
  1567: 'Garmin Edge 810',
  1570: 'Garmin Tempe',
  1600: 'Garmin Forerunner 910XT',
  1623: 'Garmin Forerunner 620',
  1632: 'Garmin Forerunner 220',
  1664: 'Garmin Forerunner 910XT',
  1688: 'Garmin Forerunner 10',
  1721: 'Garmin Edge 810',
  1735: 'Garmin Virb Elite',
  1736: 'Garmin Edge Touring',
  1742: 'Garmin Edge 510',
  1765: 'Garmin Forerunner 920XT',
  1821: 'Garmin Edge 510',
  1822: 'Garmin Edge 810',
  1823: 'Garmin Edge 810',
  1836: 'Garmin Edge 1000',
  1837: 'Garmin VivoFit',
  1853: 'Garmin Virb Remote',
  1885: 'Garmin VivoKi',
  1903: 'Garmin Forerunner 15',
  1907: 'Garmin VivoActive',
  1918: 'Garmin Edge 510',
  1928: 'Garmin Forerunner 620',
  1929: 'Garmin Forerunner 620',
  1930: 'Garmin Forerunner 220',
  1931: 'Garmin Forerunner 220',
  1936: 'Garmin Approach S6',
  1956: 'Garmin VivoSmart',
  1967: 'Garmin Fenix 2',
  1988: 'Garmin Epix',
  2050: 'Garmin Fenix 3',
  2052: 'Garmin Edge 1000',
  2053: 'Garmin Edge 1000',
  2061: 'Garmin Forerunner 15',
  2067: 'Garmin Edge 520',
  2070: 'Garmin Edge 1000',
  2072: 'Garmin Forerunner 620',
  2073: 'Garmin Forerunner 220',
  2100: 'Garmin Edge 1000',
  2130: 'Garmin Forerunner 920XT',
  2131: 'Garmin Forerunner 920XT',
  2132: 'Garmin Forerunner 920XT',
  2134: 'Garmin Virb X',
  2135: 'Garmin VivoSmart',
  2140: 'Garmin Etrex Touch',
  2147: 'Garmin Edge 25',
  2148: 'Garmin Forerunner 25',
  2150: 'Garmin VivoFit 2',
  2153: 'Garmin Forerunner 225',
  2156: 'Garmin Forerunner 630',
  2157: 'Garmin Forerunner 230',
  2158: 'Garmin Forerunner 735XT',
  2160: 'Garmin VivoActive',
  2172: 'Garmin Virb XE',
  2173: 'Garmin Forerunner 620',
  2174: 'Garmin Forerunner 220',
  2175: 'Garmin Truswing',
  2187: 'Garmin D2 Air',
  2188: 'Garmin Fenix 3',
  2189: 'Garmin Fenix 3',
  2204: 'Garmin Edge Explore 1000',
  2219: 'Garmin Forerunner 225',
  2238: 'Garmin Edge 20',
  2260: 'Garmin Edge 520',
  2261: 'Garmin Edge 520',
  2262: 'Garmin D2 Bravo',
  2266: 'Garmin Approach S20',
  2271: 'Garmin VivoSmart 2',
  2274: 'Garmin Edge 1000',
  2288: 'Garmin Edge 25',
  2289: 'Garmin Edge 25',
  2290: 'Garmin Edge 20',
  2292: 'Garmin Approach X40',
  2293: 'Garmin Fenix 3',
  2294: 'Garmin VivoSmart',
  2310: 'Garmin Forerunner 630',
  2311: 'Garmin Forerunner 630',
  2313: 'Garmin Forerunner 230',
  2332: 'Garmin Epix',
  2337: 'Garmin VivoActive HR',
  2347: 'Garmin VivoSmart Gps HR',
  2348: 'Garmin VivoSmart HR',
  2361: 'Garmin VivoSmart HR',
  2362: 'Garmin VivoSmart Gps HR',
  2368: 'Garmin VivoMove',
  2396: 'Garmin Forerunner 235',
  2397: 'Garmin Forerunner 235',
  2406: 'Garmin VivoFit 3',
  2407: 'Garmin Fenix 3',
  2408: 'Garmin Fenix 3',
  2413: 'Garmin Fenix 3 HR',
  2417: 'Garmin Virb Ultra 30',
  2429: 'Garmin Index Smart Scale',
  2431: 'Garmin Forerunner 235',
  2432: 'Garmin Fenix 3 Chronos',
  2441: 'Garmin Oregon 7XX',
  2444: 'Garmin Rino 7XX',
  2457: 'Garmin Epix',
  2473: 'Garmin Fenix 3 HR',
  2474: 'Garmin Fenix 3 HR',
  2475: 'Garmin Fenix 3 HR',
  2476: 'Garmin Fenix 3 HR',
  2477: 'Garmin Fenix 3 HR',
  2496: 'Garmin Nautix',
  2497: 'Garmin VivoActive HR',
  2512: 'Garmin Oregon 7XX WW',
  2530: 'Garmin Edge 820',
  2531: 'Garmin Edge Explore 820',
  2533: 'Garmin Forerunner 735XT',
  2534: 'Garmin Forerunner 735XT',
  2544: 'Garmin Fenix 5S',
  2547: 'Garmin D2 Bravo Titanium',
  2593: 'Garmin Running Dynamics Pod',
  2599: 'Garmin Edge 820',
  2600: 'Garmin Edge 820',
  2604: 'Garmin Fenix 5X',
  2606: 'Garmin VivoFit Junior',
  2622: 'Garmin VivoSmart 3',
  2623: 'Garmin VivoSport',
  2628: 'Garmin Edge 820',
  2629: 'Garmin Edge 820',
  2630: 'Garmin Edge 820',
  2650: 'Garmin Forerunner 35',
  2656: 'Garmin Approach S60',
  2667: 'Garmin Forerunner 35',
  2668: 'Garmin Forerunner 35',
  2675: 'Garmin Fenix 3 Chronos',
  2687: 'Garmin Virb 360',
  2691: 'Garmin Forerunner 935',
  2697: 'Garmin Fenix 5',
  2700: 'Garmin VivoActive 3',
  2733: 'Garmin Forerunner 235',
  2769: 'Garmin Foretrex 601 701',
  2772: 'Garmin VivoMove HR',
  2713: 'Garmin Edge 1030',
  2796: 'Garmin Fenix 5',
  2797: 'Garmin Fenix 5S',
  2798: 'Garmin Fenix 5X',
  2806: 'Garmin Approach Z80',
  2814: 'Garmin Forerunner 35',
  2819: 'Garmin D2charlie',
  2831: 'Garmin VivoSmart 3',
  2832: 'Garmin VivoSport',
  2833: 'Garmin Forerunner 935',
  2859: 'Garmin Descent',
  2878: 'Garmin VivoFit 4',
  2886: 'Garmin Forerunner 645',
  2888: 'Garmin Forerunner 645M',
  2891: 'Garmin Forerunner 30',
  2900: 'Garmin Fenix 5S Plus',
  2909: 'Garmin Edge 130',
  2924: 'Garmin Edge 1030',
  2927: 'Garmin Vivosmart 4',
  2945: 'Garmin VivoMove HR',
  2962: 'Garmin Approach X10',
  2977: 'Garmin Forerunner 30',
  2988: 'Garmin VivoActive 3M W',
  3003: 'Garmin Forerunner 645',
  3004: 'Garmin Forerunner 645M',
  3011: 'Garmin Edge Explore',
  3028: 'Garmin Gpsmap 66',
  3049: 'Garmin Approach S10',
  3066: 'Garmin VivoActive 3M L',
  3085: 'Garmin Approach G80',
  3092: 'Garmin Edge 130',
  3095: 'Garmin Edge 1030 Bontrager',
  3110: 'Garmin Fenix 5 Plus',
  3111: 'Garmin Fenix 5X Plus',
  3112: 'Garmin Edge 520 Plus',
  3113: 'Garmin Forerunner 945',
  3121: 'Garmin Edge 530',
  3122: 'Garmin Edge 830',
  3126: 'Garmin Instinct Esports',
  3134: 'Garmin Fenix 5S Plus',
  3135: 'Garmin Fenix 5X Plus',
  3142: 'Garmin Edge 520 Plus',
  3144: 'Garmin Forerunner 235L',
  3145: 'Garmin Forerunner 245',
  3163: 'Garmin VivoActive 3M',
  3218: 'Garmin VivoSmart 4',
  3224: 'Garmin VivoActive 4',
  3225: 'Garmin VivoActive 4',
  3226: 'Garmin Venu',
  3246: 'Garmin Marq Driver',
  3247: 'Garmin Marq Aviator',
  3248: 'Garmin Marq Captain',
  3249: 'Garmin Marq Commander',
  3250: 'Garmin Marq Expedition',
  3251: 'Garmin Marq Athlete',
  3258: 'Garmin Descent MK 2',
  3284: 'Garmin Gpsmap 66I',
  3287: 'Garmin Fenix 6S Sport',
  3288: 'Garmin Fenix 6S',
  3289: 'Garmin Fenix 6 Sport',
  3290: 'Garmin Fenix 6',
  3291: 'Garmin Fenix 6X',
  3308: 'Garmin VivoMove 3 Premium',
  3314: 'Garmin Approach S40',
  3321: 'Garmin Forerunner 245M',
  3349: 'Garmin Edge 530',
  3350: 'Garmin Edge 830',
  3378: 'Garmin VivoMove 3',
  3387: 'Garmin VivoActive 4',
  3388: 'Garmin VivoActive 4',
  3389: 'Garmin VivoActive 4',
  3405: 'Garmin Swim 2',
  3420: 'Garmin Marq Driver',
  3421: 'Garmin Marq Aviator',
  3422: 'Garmin VivoMove 3',
  3441: 'Garmin Forerunner 945',
  3446: 'Garmin VivoActive 3T',
  3448: 'Garmin Marq Captain',
  3449: 'Garmin Marq Commander',
  3450: 'Garmin Marq Expedition',
  3451: 'Garmin Marq Athlete',
  3469: 'Garmin Forerunner 45',
  3473: 'Garmin VivoActive 3',
  3512: 'Garmin Fenix 6S Sport',
  3513: 'Garmin Fenix 6S',
  3514: 'Garmin Fenix 6 Sport',
  3515: 'Garmin Fenix 6',
  3516: 'Garmin Fenix 6X',
  3542: 'Garmin Descent MK 2S',
  3558: 'Garmin Edge 130 Plus',
  3570: 'Garmin Edge 1030 Plus',
  3589: 'Garmin Forerunner 745',
  3600: 'Garmin Venu SQ',
  3615: 'Garmin Lily',
  3624: 'Garmin Marq Adventurer',
  3638: 'Garmin Enduro',
  3648: 'Garmin Marq Adventurer',
  3639: 'Garmin Swim 2',
  3703: 'Garmin Venu 2',
  3704: 'Garmin Venu 2S',
  3737: 'Garmin Venu',
  3739: 'Garmin Marq Golfer',
  3740: 'Garmin Venu',
  3794: 'Garmin Forerunner 745',
  3809: 'Garmin Lily',
  3812: 'Garmin Edge 1030 Plus',
  3813: 'Garmin Edge 130 Plus',
  3823: 'Garmin Approach S12',
  3872: 'Garmin Enduro',
  3837: 'Garmin Venu SQ',
  3850: 'Garmin Marq Golfer',
  3930: 'Garmin Descent MK 2S',
  3934: 'Garmin Approach S42',
  3949: 'Garmin Venu 2S',
  3950: 'Garmin Venu 2',
  3986: 'Garmin Approach S12',
  4002: 'Garmin Approach S42',
  10014: 'Garmin Edge Remote',
  20533: 'Tacx Training App',
  20534: 'Tacx Training App',
  20119: 'Training Center',
  30045: 'Tacx Training App',
  30046: 'Tacx Training App',
  65531: 'Garmin Connectiq Simulator',
  65532: 'Antplus Plugin'
};
