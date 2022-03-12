/*
To update this list:
- Download fit sdk here: https://developer.garmin.com/fit/download/
- Extract & go inside folder "c/"
- Create a new file named "garmin_devices.py" inside folder "c/"
- Copy paste below python script (code between "START/END SCRIPT") into the "garmin_devices.py" file
- Run `python "garmin_devices.py"`
- Retrieve list, then copy/rework it here using git diff.

###### START SCRIPT ######
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

                results[product_id] = "{}".format(name)
    return results


def main():
    products = list_garmin_products("fit_example.h")

    for pid, pname in products.items():
        print("{}: '{}',".format(pid, pname))


if __name__ == '__main__':
    main()

###### END SCRIPT ######
 */

export const ImporterFitGarminDeviceNames: { [index: number]: string } = {
  473: 'Forerunner 301',
  474: 'Forerunner 301',
  475: 'Forerunner 301',
  494: 'Forerunner 301',
  717: 'Forerunner 405',
  782: 'Forerunner 50',
  987: 'Forerunner 405',
  988: 'Forerunner 60',
  1018: 'Forerunner 310XT',
  1036: 'Edge 500',
  1124: 'Forerunner 110',
  1169: 'Edge 800',
  1199: 'Edge 500',
  1213: 'Edge 500',
  1253: 'Chirp',
  1274: 'Forerunner 110',
  1325: 'Edge 200',
  1328: 'Forerunner 910XT',
  1333: 'Edge 800',
  1334: 'Edge 800',
  1345: 'Forerunner 610',
  1360: 'Forerunner 210',
  1386: 'Edge 800',
  1387: 'Edge 500',
  1405: 'Approach G10',
  1410: 'Forerunner 610',
  1422: 'Edge 500',
  1436: 'Forerunner 70',
  1446: 'Forerunner 310XT 4T',
  1461: 'Amx',
  1482: 'Forerunner 10',
  1497: 'Edge 800',
  1499: 'Swim',
  1537: 'Forerunner 910XT',
  1551: 'Fenix',
  1555: 'Edge 200',
  1561: 'Edge 510',
  1567: 'Edge 810',
  1570: 'Tempe',
  1600: 'Forerunner 910XT',
  1623: 'Forerunner 620',
  1632: 'Forerunner 220',
  1664: 'Forerunner 910XT',
  1688: 'Forerunner 10',
  1721: 'Edge 810',
  1735: 'Virb Elite',
  1736: 'Edge Touring',
  1742: 'Edge 510',
  1765: 'Forerunner 920XT',
  1821: 'Edge 510',
  1822: 'Edge 810',
  1823: 'Edge 810',
  1836: 'Edge 1000',
  1837: 'VivoFit',
  1853: 'Virb Remote',
  1885: 'VivoKi',
  1903: 'Forerunner 15',
  1907: 'VivoActive',
  1918: 'Edge 510',
  1928: 'Forerunner 620',
  1929: 'Forerunner 620',
  1930: 'Forerunner 220',
  1931: 'Forerunner 220',
  1936: 'Approach S6',
  1956: 'VivoSmart',
  1967: 'Fenix 2',
  1988: 'Epix',
  2050: 'Fenix 3',
  2052: 'Edge 1000',
  2053: 'Edge 1000',
  2061: 'Forerunner 15',
  2067: 'Edge 520',
  2070: 'Edge 1000',
  2072: 'Forerunner 620',
  2073: 'Forerunner 220',
  2100: 'Edge 1000',
  2130: 'Forerunner 920XT',
  2131: 'Forerunner 920XT',
  2132: 'Forerunner 920XT',
  2134: 'Virb X',
  2135: 'VivoSmart',
  2140: 'Etrex Touch',
  2147: 'Edge 25',
  2148: 'Forerunner 25',
  2150: 'VivoFit 2',
  2153: 'Forerunner 225',
  2156: 'Forerunner 630',
  2157: 'Forerunner 230',
  2158: 'Forerunner 735XT',
  2160: 'VivoActive',
  2172: 'Virb XE',
  2173: 'Forerunner 620',
  2174: 'Forerunner 220',
  2175: 'Truswing',
  2187: 'D2 Air',
  2188: 'Fenix 3',
  2189: 'Fenix 3',
  2204: 'Edge Explore 1000',
  2219: 'Forerunner 225',
  2238: 'Edge 20',
  2260: 'Edge 520',
  2261: 'Edge 520',
  2262: 'D2 Bravo',
  2266: 'Approach S20',
  2271: 'VivoSmart 2',
  2274: 'Edge 1000',
  2288: 'Edge 25',
  2289: 'Edge 25',
  2290: 'Edge 20',
  2292: 'Approach X40',
  2293: 'Fenix 3',
  2294: 'VivoSmart',
  2310: 'Forerunner 630',
  2311: 'Forerunner 630',
  2313: 'Forerunner 230',
  2332: 'Epix',
  2337: 'VivoActive HR',
  2347: 'VivoSmart Gps HR',
  2348: 'VivoSmart HR',
  2361: 'VivoSmart HR',
  2362: 'VivoSmart Gps HR',
  2368: 'VivoMove',
  2396: 'Forerunner 235',
  2397: 'Forerunner 235',
  2406: 'VivoFit 3',
  2407: 'Fenix 3',
  2408: 'Fenix 3',
  2413: 'Fenix 3 HR',
  2417: 'Virb Ultra 30',
  2429: 'Index Smart Scale',
  2431: 'Forerunner 235',
  2432: 'Fenix 3 Chronos',
  2441: 'Oregon 7XX',
  2444: 'Rino 7XX',
  2457: 'Epix',
  2473: 'Fenix 3 HR',
  2474: 'Fenix 3 HR',
  2475: 'Fenix 3 HR',
  2476: 'Fenix 3 HR',
  2477: 'Fenix 3 HR',
  2496: 'Nautix',
  2497: 'VivoActive HR',
  2503: 'Forerunner 35',
  2512: 'Oregon 7XX WW',
  2530: 'Edge 820',
  2531: 'Edge Explore 820',
  2533: 'Forerunner 735XT',
  2534: 'Forerunner 735XT',
  2544: 'Fenix 5S',
  2547: 'D2 Bravo Titanium',
  2593: 'Running Dynamics Pod',
  2599: 'Edge 820',
  2600: 'Edge 820',
  2604: 'Fenix 5X',
  2606: 'VivoFit Junior',
  2622: 'VivoSmart 3',
  2623: 'VivoSport',
  2628: 'Edge 820',
  2629: 'Edge 820',
  2630: 'Edge 820',
  2650: 'Forerunner 35',
  2656: 'Approach S60',
  2667: 'Forerunner 35',
  2668: 'Forerunner 35',
  2675: 'Fenix 3 Chronos',
  2687: 'Virb 360',
  2691: 'Forerunner 935',
  2697: 'Fenix 5',
  2700: 'VivoActive 3',
  2733: 'Forerunner 235',
  2769: 'Foretrex 601 701',
  2772: 'VivoMove HR',
  2713: 'Edge 1030',
  2796: 'Fenix 5',
  2797: 'Fenix 5S',
  2798: 'Fenix 5X',
  2806: 'Approach Z80',
  2814: 'Forerunner 35',
  2819: 'D2charlie',
  2831: 'VivoSmart 3',
  2832: 'VivoSport',
  2833: 'Forerunner 935',
  2859: 'Descent',
  2878: 'VivoFit 4',
  2886: 'Forerunner 645',
  2888: 'Forerunner 645M',
  2891: 'Forerunner 30',
  2900: 'Fenix 5S Plus',
  2909: 'Edge 130',
  2924: 'Edge 1030',
  2927: 'Vivosmart 4',
  2945: 'VivoMove HR',
  2962: 'Approach X10',
  2977: 'Forerunner 30',
  2988: 'VivoActive 3M W',
  3003: 'Forerunner 645',
  3004: 'Forerunner 645M',
  3011: 'Edge Explore',
  3028: 'Gpsmap 66',
  3049: 'Approach S10',
  3066: 'VivoActive 3M L',
  3077: 'Forerunner 245',
  3085: 'Approach G80',
  3092: 'Edge 130',
  3095: 'Edge 1030 Bontrager',
  3110: 'Fenix 5 Plus',
  3111: 'Fenix 5X Plus',
  3112: 'Edge 520 Plus',
  3113: 'Forerunner 945',
  3121: 'Edge 530',
  3122: 'Edge 830',
  3126: 'Instinct Esports',
  3134: 'Fenix 5S Plus',
  3135: 'Fenix 5X Plus',
  3142: 'Edge 520 Plus',
  3144: 'Forerunner 235L',
  3145: 'Forerunner 245',
  3163: 'VivoActive 3M',
  3218: 'VivoSmart 4',
  3224: 'VivoActive 4',
  3225: 'VivoActive 4',
  3226: 'Venu',
  3246: 'Marq Driver',
  3247: 'Marq Aviator',
  3248: 'Marq Captain',
  3249: 'Marq Commander',
  3250: 'Marq Expedition',
  3251: 'Marq Athlete',
  3258: 'Descent MK 2',
  3284: 'Gpsmap 66I',
  3287: 'Fenix 6S Sport',
  3288: 'Fenix 6S',
  3289: 'Fenix 6 Sport',
  3290: 'Fenix 6',
  3291: 'Fenix 6X',
  3308: 'VivoMove 3 Premium',
  3314: 'Approach S40',
  3321: 'Forerunner 245',
  3349: 'Edge 530',
  3350: 'Edge 830',
  3378: 'VivoMove 3',
  3387: 'VivoActive 4',
  3388: 'VivoActive 4',
  3389: 'VivoActive 4',
  3405: 'Swim 2',
  3420: 'Marq Driver',
  3421: 'Marq Aviator',
  3422: 'VivoMove 3',
  3441: 'Forerunner 945',
  3446: 'VivoActive 3T',
  3448: 'Marq Captain',
  3449: 'Marq Commander',
  3450: 'Marq Expedition',
  3451: 'Marq Athlete',
  3466: 'Instinct Solar',
  3469: 'Forerunner 45',
  3473: 'VivoActive 3',
  3512: 'Fenix 6S Sport',
  3513: 'Fenix 6S',
  3514: 'Fenix 6 Sport',
  3515: 'Fenix 6',
  3516: 'Fenix 6X',
  3542: 'Descent MK 2S',
  3558: 'Edge 130 Plus',
  3570: 'Edge 1030 Plus',
  3589: 'Forerunner 745',
  3600: 'Venu SQ',
  3615: 'Lily',
  3624: 'Marq Adventurer',
  3638: 'Enduro',
  3648: 'Marq Adventurer',
  3639: 'Swim 2',
  3652: 'Forerunner 945',
  3703: 'Venu 2',
  3704: 'Venu 2S',
  3737: 'Venu',
  3739: 'Marq Golfer',
  3740: 'Venu',
  3794: 'Forerunner 745',
  3809: 'Lily',
  3812: 'Edge 1030 Plus',
  3813: 'Edge 130 Plus',
  3823: 'Approach S12',
  3872: 'Enduro',
  3837: 'Venu SQ',
  3850: 'Marq Golfer',
  3869: 'Forerunner 55',
  3930: 'Descent MK 2S',
  3934: 'Approach S42',
  3949: 'Venu 2S',
  3950: 'Venu 2',
  3978: 'Forerunner 945',
  3986: 'Approach S12',
  4002: 'Approach S42',
  4033: 'Forerunner 55',
  10014: 'Edge Remote',
  20533: 'Tacx Training App',
  20534: 'Tacx Training App',
  20119: 'Training Center',
  30045: 'Tacx Training App',
  30046: 'Tacx Training App',
  65531: 'Connectiq Simulator',
  65532: 'Antplus Plugin',
  65534: 'Connect'
};
