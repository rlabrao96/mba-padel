export function RulesView() {
  return (
    <div className="space-y-4">
      <InfoBox title="Tournament format">
        <ul>
          <li>12 teams divided into 3 groups of 4 (pre-drawn).</li>
          <li>Round-robin within each group — 6 matches per group, 18 total.</li>
          <li>
            All matches are a <strong>Super Set to 8 games</strong> with side
            changes and a star point (tie-break point at 7–7).
          </li>
          <li>Estimated duration: ~1 hour per match.</li>
        </ul>
      </InfoBox>

      <InfoBox title="Standings criteria">
        <ol>
          <li>Matches won</li>
          <li>Game difference (games for − games against)</li>
          <li>Total games won</li>
        </ol>
      </InfoBox>

      <InfoBox title="Classification from groups">
        <ul>
          <li>
            <strong>Gold Cup (8 teams):</strong> Top 2 from each group + best 2
            of 3 third-place teams.
          </li>
          <li>
            <strong>Bronze Cup (4 teams):</strong> Worst third-place team + all
            4th-place teams.
          </li>
          <li>
            Best thirds are ranked by: (1) matches won, (2) game difference.
          </li>
        </ul>
      </InfoBox>

      <InfoBox title="Gold Cup seeding">
        <ul>
          <li>Seeds 1–3: Group winners, ranked by W → Diff → Games.</li>
          <li>Seeds 4–6: Group runners-up, same criteria.</li>
          <li>Seeds 7–8: Qualified third-place teams, same criteria.</li>
        </ul>
      </InfoBox>

      <InfoBox title="Brackets">
        <ul>
          <li>
            <strong>Gold Cup QF:</strong> 1v8, 4v5, 2v7, 3v6.
          </li>
          <li>
            <strong>Gold Cup SF:</strong> W(1v8) vs W(4v5) · W(2v7) vs W(3v6).
          </li>
          <li>
            <strong>Gold Cup Final + 3rd Place Match:</strong> The two SF
            winners play for the trophy; the two SF losers play a separate
            match for 3rd place.
          </li>
          <li>
            <strong>Silver Cup:</strong> The four Gold Cup QF losers (SF → Final).
          </li>
          <li>
            <strong>Bronze Cup:</strong> Non-qualified teams (SF → Final).
          </li>
        </ul>
      </InfoBox>

      <InfoBox title="Schedule">
        <ul>
          <li>
            <strong>Saturday April 11 · 2:00 PM – 11:00 PM:</strong> Group stage
            + Gold QF + Bronze SF.
          </li>
          <li>
            <strong>Sunday April 12 · 11:00 AM – 3:00 PM:</strong> Silver SF +
            Bronze Final (11 AM), Gold SF (12 PM), Silver Final + Gold 3rd
            Place (1 PM), Gold Grand Final (2 PM).
          </li>
          <li>4 courts available throughout.</li>
        </ul>
      </InfoBox>

      <InfoBox title="Venue & sponsorship">
        <p>
          Hosted at <strong>PadelHub USA</strong>, 653 Summer St., Boston, MA.
          Presented by <strong>Adidas</strong>. Confirmed schools: Harvard
          (HBS), MIT, Wharton, Yale SOM, Chicago Booth, Boston University, and
          more.
        </p>
      </InfoBox>
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-surface/70 p-5 shadow-md shadow-black/20">
      <h3 className="mb-3 font-display text-lg tracking-[0.18em] text-primary-bright">
        {title}
      </h3>
      <div className="space-y-2 text-sm leading-relaxed text-text-dim [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal">
        {children}
      </div>
    </section>
  );
}
