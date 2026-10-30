---
sip: 1
title: SIP Purpose and Guidelines
description: How SKAI Improvement Proposals are written, discussed, reviewed and accepted
author: Casey (@skaicasey)
discussions-to: https://forum.skairesear.ch/t/sip-1-sip-purpose-and-guidelines/16
status: Living
type: Meta
created: 2026-10-29
summary: >
  A SIP is how a change to SKAI is proposed and recorded. This SIP says what a
  SIP must contain, where it is discussed, how it moves from Draft to Final,
  and how a SIP enters a chain upgrade.
---

## Abstract

A SKAI Improvement Proposal (SIP) is a design document for a change to the SKAI chain, its markets, its interfaces or its processes. It states the change precisely, argues for it, and records the decision. This SIP defines the format, the statuses, the upgrade stages and the editors' role. It is Living: it changes as the process does.

## Motivation

Changes to a chain affect people who were not in the room. SIPs put each change in writing, in public, before it ships, with a discussion anyone can join and a history anyone can check. The process follows Ethereum's EIP-1 and EIP-7723 closely, so anyone who has written an EIP can write a SIP, and adds what SKAI needs: a market category, a plain-language summary, an impact line for each kind of user, and a governance tier.

## Specification

### Where things happen

- **Ideas** start in the Research category of [forum.skairesear.ch](https://forum.skairesear.ch). An idea is not tracked.
- **SIP text** lives in this repository, `SIPS/sip-<n>.md`, released under CC0.
- **Discussion** of each SIP happens in one thread in the SIPs category, named in `discussions-to`.
- **The published SIP**, with its history, is at `https://skairesear.ch/sips/<n>/`.

### Types

- **Standards Track**, with a `category`:
  - **Core**: consensus, the state machine, native modules and predeploys; anything that needs an app-version upgrade.
  - **Market**: the order book, matching, perps, prediction markets, fees and risk parameters.
  - **Interface**: RPC methods, SDKs, the MCP server and client APIs.
  - **Contract**: application-level contract standards on SKAI.
- **Meta**: process, including one Meta SIP per chain upgrade.
- **Informational**: guidance and design notes. Readers may ignore them.

### Statuses

- **Draft**: merged with a number, in the right format.
- **Review**: the author asks for review.
- **Last Call**: the final window, with a `last-call-deadline` at least 14 days after the move. A normative change sends it back to Review.
- **Final**: settled. Only errata and non-normative fixes after this.
- **Stagnant**: Draft, Review or Last Call with no change for 6 months. An editor sets it; the author or an editor revives it to Draft or Review.
- **Withdrawn**: withdrawn by its author, with a `withdrawal-reason`. Permanent for that number.
- **Living**: a Meta SIP that is never finished, such as this one.

Allowed moves: Draft to Review, Withdrawn or Stagnant. Review to Draft, Last Call, Withdrawn or Stagnant. Last Call to Review, Final (after the deadline), Withdrawn or Stagnant. Stagnant to Draft or Review. Final, Withdrawn and Living do not move.

A new SIP enters as Draft. A Meta process document may enter as Living, and the record of an upgrade that already happened may enter as Final.

Every change of status, and every move within an upgrade, carries a `Forum:` line linking the post that justified it. In a pull request it goes in the description; the squash merge copies it into the commit.

### Header

```yaml
sip: 12
title: Open orders by trader RPC
description: One RPC call returns every open order a trader has across all markets
author: Jane Doe (@janedoe)
discussions-to: https://forum.skairesear.ch/t/sip-12-open-orders-by-trader-rpc/123
status: Draft
type: Standards Track
category: Interface
created: 2026-11-02
requires: [3]
summary: >
  Showing a trader's open orders today takes one call per market. This adds a
  read-only call that returns all of them at once.
impact:
  traders: Open orders load faster in every app.
  market-makers: One call instead of one per market when reconciling quotes.
  validators: One new read-only method on RPC nodes; no consensus change.
  app-developers: A new method in the SDK and MCP server.
  wallets: Can list open orders without a call per market.
  players: No change.
  holders: No change.
```

- `title` is at most 44 characters and `description` at most 140; neither repeats the SIP number.
- At least one author has a GitHub handle, written `Name (@handle)`.
- `discussions-to` is a thread on forum.skairesear.ch.
- `category` appears only on Standards Track SIPs; `last-call-deadline` only in Last Call; `withdrawal-reason` only when Withdrawn.
- `summary` is plain language for someone who does not read code, at most 600 characters.
- `impact` has one line for each of `traders`, `market-makers`, `validators`, `app-developers`, `wallets`, `players` and `holders`. On a Standards Track SIP every line is required from Review on. "No change." is an answer; a missing line is not.
- `governance-tier` is 1, 2 or 3, as defined on offer.skai.trade/governance, when the change needs a governance vote, and absent when it does not.

### Sections

Every SIP has Abstract, Motivation, Specification, Rationale, Backwards Compatibility, Security Considerations and Copyright, in that order. Core and Market SIPs add Test Cases before Last Call. A Reference Implementation is optional. A SIP without Security Considerations is refused.

### Upgrades

Each chain upgrade has one Meta SIP. Its header lists SIPs in five stages, and records the rollout and activation:

- **Proposed**: anyone proposes a SIP for this upgrade. Proposals do not carry over to the next one.
- **Considered**: the chain maintainers intend to try it. It needs an implementation branch in skai-chain.
- **Scheduled**: on track. Its test cases are merged, and the binary carrying it has run dark (switched off, waiting on its activation height) on every chain 7254 validator for at least 7 days with no critical bug.
- **Declined**: out of this upgrade. It can be proposed again for a later one.
- **Included**: activated on chain 7254 at the recorded height.

`rollout.date` is the day the binary was running dark on every validator. `activation.height` is recorded once the height is fixed in the binary; `activation.date` once that height has passed. Heights are read from the chain, never estimated.

### Editors

Editors check a SIP's form, assign the next free number, and merge. They do not judge whether a proposal is good; the discussion does that. Editors are listed here. A new editor is added by a pull request to this SIP that the existing editors approve.

Editors: Casey (@skaicasey).

An editor may accept a problem the checker finds in published history, which cannot be rewritten, by listing the commit in `history-exceptions.json` with the reason.

### Security

A fix for a vulnerability that is not yet patched on chain 7254 is not published as a SIP before it activates. It gets its SIP afterwards, linking the disclosure. Security reports go to security@skai.trade, never to a SIP or the forum.

## Rationale

The statuses, header and sections follow EIP-1 so that the process is familiar. The upgrade stages follow EIP-7723. The 7-day dark run replaces EIP-7723's testnet run because SKAI ships changes dark behind an activation height and has no hosted testnet. The summary and impact lines bring Forkcast's plain-language view into the SIP itself, written by the author who knows the change best. The decisions log on skairesear.ch is read from this repository's history, so a decision exists only once it is merged.

## Backwards Compatibility

This is the first SIP. Upgrades before it are recorded after the fact as SIP-2 and SIP-3.

## Security Considerations

SIP text is contributed by anyone. skairesear.ch renders it with raw HTML removed and the result sanitized. The checker runs on every pull request and on every build of the site, so a SIP that breaks the format cannot be published.

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
