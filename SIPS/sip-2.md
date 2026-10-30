---
sip: 2
title: Upgrade v2
description: The record of chain upgrade v2, from app version 1 to 2
author: Casey (@skaicasey)
discussions-to: https://forum.skairesear.ch/t/upgrade-v2/17
status: Final
type: Meta
created: 2026-10-28
summary: >
  Upgrade v2 moved SKAI Chain from app version 1 to 2. It added metrics, the
  privacy layer, gaming payouts and TLS configuration, and changed no stored
  data. It predates SIPs and is recorded here so the upgrade history is complete.
upgrade:
  version: 2
  proposed: []
  considered: []
  scheduled: []
  declined: []
  included: []
  rollout: { date: null }
  activation: { height: null, date: null }
---

## Abstract

Upgrade v2 moved SKAI Chain from app version 1 to 2. It predates SIPs, so its changes are listed here rather than as separate SIPs.

## Motivation

skairesear.ch tracks every chain upgrade. This record starts that history at the first version change.

## Specification

The changes, as registered in `DefaultUpgradeRegistry` (`core/abci/upgrade.go` in skai-chain):

- Metrics.
- The privacy layer.
- Gaming payouts.
- TLS configuration.

The migration (`upgradeV2`) transforms no data. The commit hash (block height, transaction count and previous hash) is unchanged, so blocks from app version 1 replay identically on the new binary.

## Rationale

Recorded from the upgrade registry. The activation height was not recorded at the time, and is left empty rather than estimated.

## Backwards Compatibility

State-compatible: no stored data changed.

## Security Considerations

None beyond those of the changes listed.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
