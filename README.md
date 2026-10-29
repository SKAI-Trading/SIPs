# SKAI Improvement Proposals

A SIP is a design document for a change to SKAI: the chain, its markets, its interfaces, or the process itself. Each SIP is discussed on [forum.skairesear.ch](https://forum.skairesear.ch) and published at [skairesear.ch/sips](https://skairesear.ch/sips/).

Start with [SIP-1](SIPS/sip-1.md), which says how a SIP is written, reviewed and accepted.

## Proposing a change

1. Post the idea in the Research category of the forum and gather feedback.
2. Copy [sip-template.md](sip-template.md) to `SIPS/sip-<n>.md`, using the next free number. Editors renumber it if two drafts collide.
3. Open a thread for it in the SIPs category of the forum and put the thread's URL in `discussions-to`.
4. Run `npm ci && npm run check` and open a pull request.

Editors check form, not merit. A change of status, or a move within an upgrade, needs a `Forum:` line linking the post that justified it. Put it in the pull request description; the squash merge carries it into the commit.

Security reports never go in a SIP or on the forum. Write to security@skai.trade.

## License

SIP text is released under [CC0 1.0](LICENSE).
