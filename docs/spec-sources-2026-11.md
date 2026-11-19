# Spec & listing sources — November 2026 revamp

Checked **2026-11-19** (America/New_York). Prices and stock come from each vendor's public WooCommerce Store API
(the same API `script/fetch-prices.ts` uses). Specs are manufacturer figures unless noted.

## New models

| Model | Specs | Source |
|---|---|---|
| Bitdeer SealMiner A4 Ultra Hydro | 886 TH/s, 8,372.7 W, 9.45 J/TH, hydro, 380–480 V 3-phase | Bitdeer press release, 2026-04-07 (globenewswire.com/news-release/2026/04/07/3269133); voltage from Crypto Miner Bros listing |
| Bitdeer SealMiner A4 Pro Hydro | 680 TH/s, 7,412 W, 10.9 J/TH, hydro, 380–480 V 3-phase | Bitdeer press release, 2026-04-07; Bitdeer shop (bitdeer.com/shop/product/P260328000002) |
| Bitmain Antminer S23e U2H | 865 TH/s, 8,650 W, 10 J/TH, 2U hydro, 380–480 V 3-phase | Bitmain news, 2026-01-27 (bitmain.com/news-detail/bitmain-launches-antminer-s23e-u2h-432); S23e U2H product manual v1.0.5 |
| MicroBT Whatsminer M73S | 500–552 TH/s, 7,200 W normal / 10 kW high-performance, 13.5 J/TH, hydro, 380–480 V | MicroBT M73S specification sheet (Dec 2025) |
| MicroBT Whatsminer M70S | 226–258 TH/s, 3,140–3,500 W, 13.5 J/TH, air, 220–240 V | MicroBT M70-series launch specs (Hashrate Index, "MicroBT Reveals the Whatsminer M70 Series"); vendor listings sell the 226 TH/s bin |
| Bitmain Antminer L11 | 20 GH/s, 3,680 W, 0.184 J/MH, air, 220–277 V, released Sep 2025 | Bitmain L11 product manual (Sep 2025) |
| Bitaxe Naja Duo 1201 | ~4.4 TH/s at ~42 W (~9.5 J/TH) stock, 12 V DC XT30, 2× BM1373 | Solo Satoshi product page and spec article (checked by Solo Satoshi 2026-11-09) |

## Spec corrections to existing models

- **Avalon Q**: efficiency was shown as 16 J/TH next to the Super-mode figures (90 TH/s, 1,674 W). 1,674 W ÷ 90 TH/s = 18.6 J/TH, so it now reads "18.6 J/TH (Super mode)". 16 J/TH is the Eco-mode figure (53 TH/s, 850 W).
- **Avalon Mini 3**: power was 600 W; Canaan's own materials list 37.5 TH/s with up to 800 W (Canaan BTCHEL press release). Now "800W (max)", ~21.3 J/TH.

## Moved to legacy (pages kept, no URLs removed)

| Model | Efficiency | Superseded by |
|---|---|---|
| Antminer S21 | 17.5 J/TH | Antminer S21 XP (13.5) |
| Antminer T21 | 19 J/TH | Antminer S21 XP (13.5) |
| Whatsminer M60S | 18.4 J/TH | Whatsminer M70S (13.5) |
| Avalon A1566I | 17.8 J/TH | Avalon A16 (13.8) |
| (already legacy) Whatsminer M50S, Antminer L7 | 26 J/TH, 0.36 J/MH | now point to M70S / L11 |

## Researched but not added

- **Auradine Teraflux (AT2880/AH3880/AI3680)**: Auradine rebranded to Velaura AI in 2026 and stopped selling miners; published specs are 14.8–19 J/TH. No current retail listing.
- **Whatsminer M73S+, M76S, M79S, M7D**: manufacturer specs exist, but none of the site's vendors list them.
- **Antminer S23 Immersion (442 TH/s)**: specs only confirmed from resellers, not Bitmain.
- **Antminer L11 Hyd / L11 Pro, SealMiner DL1**: listed by vendors, but no manufacturer spec sheet confirmed.
- **New Canaan home models**: Canaan says new Avalon Home heaters are coming but has not published specs.
- **Kaspa (Antminer KS7)**: the site does not cover kHeavyHash miners.
