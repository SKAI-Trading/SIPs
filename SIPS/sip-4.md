---
sip: 4
title: Upgrade v4
description: The SIPs in chain upgrade v4 and where each one stands
author: Casey (@skaicasey)
discussions-to: https://forum.skairesear.ch/t/upgrade-v4/19
status: Draft
type: Meta
created: 2026-10-28
summary: >
  Upgrade v4 is the next chain upgrade. This SIP tracks what goes into it and
  when it activates on chain 7254.
upgrade:
  version: 4
  proposed: []
  considered: []
  scheduled: []
  declined: []
  included: []
  rollout: { date: null }
  activation: { height: null, date: null }
---

## Abstract

Upgrade v4 is the next chain upgrade. Its SIPs are listed in the header by stage as each one is written up and proposed.

## Motivation

One place to see what v4 contains, what stage each change is at, and when it activates.

## Specification

Changes already built and waiting on an activation height, each to become its own SIP:

- **Casino minimum bet.** The minimum casino bet becomes 0.25 sUSD.
- **Darts payout tables.** Darts pays a separate payout table for each difficulty.
- **Wheel tiers and coinflip target.** Fortune Wheel gets difficulty tiers, and coinflip gets a target option.
- **Sugar Rush.** Sugar Rush runs on the new slot engine, with a 49 sUSD maximum bet.
- **Hi-Lo with cards.** A card version of Hi-Lo, settled on the player's signed moves.
- **Points stakes.** Casino bets can be staked and paid in points.
- **Bigger Mines boards.** Mines adds 6x6, 7x7 and 8x8 boards.
- **Blackjack doubles and splits.** Blackjack rounds with doubles and splits.
- **Shared Price Grid path.** Price Grid uses one shared price path for all players.
- **Keno and Plinko reserves.** Keno and Plinko reserve their own top prize, so larger stakes fit.
- **Perp take-profit and stop-loss.** Take-profit and stop-loss on perp positions.
- **Perp limit and stop orders.** Limit and stop entry orders for perps.
- **Perps on the order book.** Perps move to a peer-to-peer order book, with margin checked when an order is placed and when it fills.
- **Tiered spot taker fee.** The spot taker fee becomes 12 bps at Free and Bronze and 10 bps from Silver up, down from a flat 50 bps.
- **Spot swap fee.** Spot swap orders pay 1% on top of the taker fee.
- **sUSD gas to the fee distributor.** sUSD gas fees are paid to the FeeDistributor.
- **Stranded gas fees to the treasury.** A one-time move of stranded sUSD gas fees to the treasury.

## Rationale

Each change becomes a SIP so it can be discussed, reviewed and scheduled on its own.

## Backwards Compatibility

Described in each SIP this upgrade includes.

## Security Considerations

Described in each SIP this upgrade includes. Fixes for vulnerabilities are not listed before they activate.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
