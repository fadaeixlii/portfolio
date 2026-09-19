# Strings from the imported design

Taken from `portfolio-i18n.js`, **with the banned claims already corrected**. The design's
own copy said "Seven years…" in all five locales; those lines are rewritten here.

The design uses flat keys (`nav.home`). Our message files are nested (`nav: { home }`).
Map them into the existing structure rather than flattening ours.

## Greek — the new locale

The design adds `el`. Adopt it; he lives in Athens. Mark the file `"_status": "machine"` like
de/nl/fa.

```
nav:        Αρχική · Έργα · Εμπειρία · Τεχνολογίες · Επικοινωνία
cta.book:   Κλείστε κλήση
cta.all:    Όλα τα έργα
cta.back:   Πίσω στα έργα
cta.live:   Δείτε το site
work.sub:   Εννέα προϊόντα σε AI, marketplaces και Web3.
exp.sub:    Κάθε ρόλος από το 2019, με τον πιο πρόσφατο πρώτα.
stack.sub:  Τι χρησιμοποιώ, ανά επίπεδο.
sec.work:   ΕΠΙΛΕΓΜΕΝΑ / ΕΡΓΑ
sec.recent: ΠΡΟΣΦΑΤΑ / ΕΡΓΑ
sec.stack:  ΤΟ / STACK
sec.contact: ΑΣ ΣΥΝΕΡΓΑΣΤΟΥΜΕ / ΜΑΖΙ
skills:     Frontend · Backend · Δεδομένα · AI & LLM · Blockchain · Εργαλεία & DevOps
form:       Όνομα · Email · Μήνυμα · Αποστολή
form.phName: Το όνομά σας
form.phMsg:  Τι χτίζετε;
form.or:     ή χωρίς φόρμα —
form.sent:   Ευχαριστώ — απαντώ εντός 48 ωρών.
meta:       Ρόλος · Έτος · Πελάτης · Ομάδα · Διάρκεια · Τεχνολογίες · Επισκόπηση
meta.available: Διαθέσιμος για έργα
footer.tag: Συστήματα που μετρούν το κόστος τους.
```

## The experience heading — rewritten in all five

The design says "SEVEN YEARS OF / EXPERIENCE". The year count is banned. Use the
role-count-free phrasing, which is also stronger:

| | line 1 | line 2 |
|---|---|---|
| en | EVERY ROLE | SINCE 2019 |
| de | JEDE ROLLE | SEIT 2019 |
| nl | ELKE ROL | SINDS 2019 |
| el | ΚΑΘΕ ΡΟΛΟΣ | ΑΠΟ ΤΟ 2019 |
| fa | هر نقش | از ۲۰۱۹ |

## The hero bio — rewritten in all five

The design's bio opens "Seven years shipping…". Drop the count, keep the specificity, which
was the good part:

- **en** — "I build the parts that have to work: billing pipelines, model gateways, on-chain settlement."
- **de** — "Ich baue die Teile, die funktionieren müssen: Billing-Pipelines, Model-Gateways, On-Chain-Settlement."
- **nl** — "Ik bouw de onderdelen die het moeten doen: billing pipelines, model gateways, on-chain afwikkeling."
- **el** — "Φτιάχνω τα κομμάτια που δεν επιτρέπεται να σπάσουν: χρεώσεις, model gateways, on-chain εκκαθάριση."
- **fa** — "بخش‌هایی را می‌سازم که نباید از کار بیفتند: خط پرداخت، دروازهٔ مدل‌ها و تسویهٔ زنجیره‌ای."

## Hero kicker

The design has `AI & Web3 · Athens` — a middle-dot meta string, which the spec bans. Render
as two elements with real layout, or use "AI and Web3, from Athens".

## Stats — three, not four

The design's four-stat row includes two banned figures. Keep three:

| value | label (en) |
|---|---|
| `2019` | since |
| `9` | shipped products |
| `3` | EU providers |

Existing `Readout` already formats these and prints Persian digits under `fa`.

## Footer statement

Already matches what the site says: "Systems that count what they cost." The design's own
translations for it are good — keep them, and add the Greek above.
