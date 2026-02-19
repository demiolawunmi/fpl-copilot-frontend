import type { Fixture } from '../../data/gwOverviewMocks';
import { fplEndpoints } from '../../api/fpl/endpoints';

interface FixturesCardProps {
  fixtures: Fixture[];
}

const FixturesCard = ({ fixtures }: FixturesCardProps) => {
  // Group fixtures by date
  const fixturesByDate = fixtures.reduce((acc, fixture) => {
    const date = fixture.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const dates = Object.keys(fixturesByDate).sort();

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Fixtures</h2>
      
      {dates.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No fixtures available</p>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-slate-400 mb-3">
                {new Date(date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              <div className="space-y-2">
                {fixturesByDate[date].map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FixtureRow = ({ fixture }: { fixture: Fixture }) => {
  const homeBadge = fplEndpoints.teamBadge(fixture.homeTeamCode, 't40');
  const awayBadge = fplEndpoints.teamBadge(fixture.awayTeamCode, 't40');

  return (
    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-4">
      {/* Home team */}
      <div className="flex items-center gap-3 flex-1">
        <img
          src={homeBadge}
          alt={fixture.homeTeam}
          className="w-8 h-8"
          loading="lazy"
        />
        <span className="text-sm font-medium text-white">
          {fixture.homeTeam}
        </span>
      </div>

      {/* Score or time */}
      <div className="flex items-center gap-4 px-4">
        {fixture.finished ? (
          <div className="flex items-center gap-2 text-center">
            <span className="text-lg font-bold text-white">
              {fixture.homeScore}
            </span>
            <span className="text-slate-400">-</span>
            <span className="text-lg font-bold text-white">
              {fixture.awayScore}
            </span>
          </div>
        ) : fixture.started ? (
          <span className="text-sm font-medium text-emerald-400">LIVE</span>
        ) : (
          <span className="text-sm text-slate-400">{fixture.kickoffTime}</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <span className="text-sm font-medium text-white">
          {fixture.awayTeam}
        </span>
        <img
          src={awayBadge}
          alt={fixture.awayTeam}
          className="w-8 h-8"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default FixturesCard;
