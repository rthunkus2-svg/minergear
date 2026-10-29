# Miner image sources (added 2026-10-29)

All images were downloaded, trimmed, and resized to at most 600px as WebP (quality 82–85). Each one is the product image for that exact model's listing.

| Miner | Source | Image URL |
|---|---|---|
| Antminer S23 Hyd | Bitmain official shop (product gallery) | https://assets-www.bitmain.com.cn/shop-image-storage-s3/product/2026/04/16/18/d437f47a-d369-4d36-8871-dee6065c1bfb.png |
| Antminer S23 XP Hyd | Bitmain official shop (product gallery, uploaded on the launch date) | https://assets-www.bitmain.com.cn/shop-image-storage-s3/product/2026/08/28/16/8f94f48f-6c0a-4e3e-81a3-6289acdaa56d.png |
| Antminer S21e XP Hyd | Bitmain official shop (product gallery; Bitmain uses its standard Hyd chassis photo) | https://assets-www.bitmain.com.cn/shop-image-storage-s3/product/2023/09/27/13/933f5e4b-1e3c-4d8d-ae28-34e59f3504be.jpg |
| Avalon A16 | Canaan official shop (shop.canaan.io/products/avalon-miner-a16-282t) | https://static.canaan.io/prod/u_file/2609/20/products/71-62e0.png |
| Avalon A16 XP | Canaan official shop (shop.canaan.io/products/avalon-miner-a16xp-300t). Canaan uses the same photo for the A16 and A16XP, which share a chassis. | https://static.canaan.io/prod/u_file/2609/20/products/71-9075.png |
| SealMiner A4 Pro Air | Bitdeer official shop (bitdeer.com/shop/product/P260328000001, alt "SEALMINER A4 Pro Air") | https://file.bitdeer.com/bd-public-prod/shop/202605/8689f35c-6e2e-4409-8f35-7d8d237de018.png |
| Nerdaxe Gaia | Bitronics store, the maker's shop (bitronics.store/products/nerdaxe-gaia) | https://cdn.shopify.com/s/files/1/1001/0683/0163/files/Group_1877.png |
| NerdQX | Crypto Miner Bros product listing | https://www.cryptominerbros.com/wp-content/uploads/2026/07/NerdQX.webp |
| Whatsminer M70S+ (added later on 2026-10-29) | MicroBT official site, whatsminer.com home-page M70S+ banner. The unit is labelled "whatsminer M70S+" on the chassis. The banner crops the bottom of the miner, so the image is bottom-aligned on white. | https://aws-microbt-com-bucket.s3.us-west-2.amazonaws.com/20251209M70S%2Bbannerhome_1765258885531.png |

## Placeholder
- None. The earlier M70S+ placeholder was replaced with MicroBT's own M70S+ banner render, shown above.

## Spec sources (2026-10-29 fixes)
- **Whatsminer M70S+**: MicroBT's official product manual (December 2025) lists 244–280 TH/s ±5%, 12.5 J/T ±5%, 3140–3500 W ±10%, AC 220–240 V and air cooling. Manual: https://aws-microbt-com-bucket.s3.us-west-2.amazonaws.com/WhatsMinerM70S%2B_1775811512444.pdf (linked from whatsminer.com > Support > Product Manual).
- **Bitaxe Gamma Duo 650**: 5V DC through a 5.5×2.1 mm center-positive barrel jack, with at least 6A for stock operation. Never use 12V. Solo Satoshi bundles a 5V 8A 40W supply. Source: https://www.solosatoshi.com/product/bitaxe-duo-bitcoin-solo-miner-650-model/ ("Power input").
- **Bitaxe GT 801**: 12V DC through an XT30 connector. The official hardware repo uses an XT30PW-M as its power input footprint (github.com/bitaxeorg/BitaxeGT, Supply.kicad_sch) and lists a "12V BAP". The optional supply is 12.4V 10A 124W. Sources: https://www.solosatoshi.com/product/bitaxe-gt-gamma-turbo/ and https://www.solosatoshi.com/product/12-4v-10a-124w-switching-power-supply-with-xt30-connector/
- **Bitaxe Turbo Touch**: built on the GT 801 platform, 12V DC through XT30, with a 12.4V 10A supply included. Source: https://www.solosatoshi.com/product/bitaxe-touch/
