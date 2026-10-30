---
sip: 3
title: Upgrade v3
description: The record of chain upgrade v3, from app version 2 to 3
author: Casey (@skaicasey)
discussions-to: https://forum.skairesear.ch/t/upgrade-v3/18
status: Final
type: Meta
created: 2026-10-28
summary: >
  Upgrade v3 moved SKAI Chain to app version 3. It added casino coinflip, the
  chain upgrade mechanism and KMS signing, and made each module's state part of
  the block's AppHash from a recorded height on. It predates SIPs.
upgrade:
  version: 3
  proposed: []
  considered: []
  scheduled: []
  declined: []
  included: []
  rollout: { date: null }
  activation: { height: 1, date: null }
---

## Abstract

Upgrade v3 moved SKAI Chain from app version 2 to 3, the version running today (`AppVersionCurrent = 3`). It predates SIPs, so its changes are listed here.

## Motivation

skairesear.ch tracks every chain upgrade; this is the second record.

## Specification

The changes, as registered in `DefaultUpgradeRegistry` (`core/abci/upgrade.go` in skai-chain):

- Casino coinflip.
- The chain upgrade mechanism.
- KMS signing.
- The governance, prediction, gaming and fee modules' state hashes join the AppHash in `Commit()`.

So that blocks from app version 2 still replay, the module hashes are included only from `moduleHashActivationHeight` on, stored in state under `upgrade:v3:module_hash_activation_height`. That height is this upgrade's activation height. On chain 7254 it is 1, so v3's rules have applied since genesis.

## Rationale

Gating the new AppHash on a stored height lets the new binary replay old blocks and produce the same hashes they had.

## Backwards Compatibility

Blocks before the activation height replay with the old AppHash. From that height on, a node without the v3 binary computes a different AppHash and cannot follow the chain.

## Security Considerations

Including module state in the AppHash means validators now agree on that state, not only on block order. A node whose module state diverges is detected at the next block instead of silently.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
