import { getPoolLengthEvidence } from './fit-pool-evidence';
import { EventImporterFIT } from './importer.fit';

// Exercise the same decoded-field readers used by the importer; no source files.
const importer = EventImporterFIT as any;
const read = {
  number: importer.getNumericValue.bind(importer),
  index: importer.getMessageIndexValue.bind(importer),
  date: importer.getDateFromValue.bind(importer),
  window: importer.getLapWindow.bind(importer),
  enum: importer.getFitEnumValue.bind(importer),
  type: importer.getSwimLengthType.bind(importer)
};
const time = (second: number) => new Date(Date.UTC(2026, 0, 1) + second * 1000);
function fixture(missing = false) {
  const lengths: any[] = [0, 1, 2].map(index => ({
    message_index: { value: index },
    start_time: time(missing && index === 2 ? 86400 : index * 30),
    timestamp: time(90),
    total_elapsed_time: 30,
    total_timer_time: 30,
    length_type: 'active'
  }));
  const lap: any = {
    start_time: time(0),
    timestamp: time(90),
    first_length_index: 0,
    num_lengths: 3,
    num_active_lengths: 3,
    lengths: missing ? lengths.slice(0, 2) : [...lengths]
  };
  const session: any = {
    start_time: time(0),
    timestamp: time(90),
    sport: 'swimming',
    sub_sport: 'lap_swimming',
    pool_length: 25,
    laps: [lap],
    lengths: [...lap.lengths]
  };
  return { file: { sessions: [session], lengths }, lap, session, lengths };
}
type Source = ReturnType<typeof fixture>;

describe('FIT pool source evidence guards', () => {
  it('keeps source objects and assigned ownership immutable', () => {
    const { file, lengths } = fixture(),
      before = JSON.stringify(file);
    const proof = getPoolLengthEvidence(file, read);
    expect(proof.ends.size).toBe(2);
    expect(proof.ends.get(lengths[0])).toEqual(time(30));
    expect(proof.ends.has(lengths[2])).toBe(false); // no inferred terminal endpoint
    expect(JSON.stringify(file)).toBe(before);
    expect(getPoolLengthEvidence(file, read).ends).toEqual(proof.ends);
    expect(getPoolLengthEvidence({ sessions: [], lengths: [] }, read).ends.size).toBe(0);
  });

  const endpointRejections: Array<[string, (s: Source) => void]> = [
    [
      'negative timer',
      s => {
        s.lengths[0].total_timer_time = -1;
      }
    ],
    [
      'non-finite elapsed',
      s => {
        s.lengths[0].total_elapsed_time = Infinity;
      }
    ],
    [
      'different next timestamp',
      s => {
        s.lengths[1].timestamp = time(80);
      }
    ],
    [
      'inferred rather than recorded next start',
      s => {
        delete s.lengths[1].start_time;
        s.lengths[1].total_elapsed_time = 60;
      }
    ],
    [
      'ordinary timestamp precision',
      s => {
        s.lengths[0].timestamp = s.lengths[1].timestamp = time(31);
      }
    ],
    [
      'fractional range',
      s => {
        s.lap.num_lengths = 3.5;
      }
    ],
    [
      'negative range start',
      s => {
        s.lap.first_length_index = -1;
      }
    ],
    [
      'missing next ownership',
      s => {
        s.lap.lengths = [s.lengths[0]];
      }
    ],
    [
      'missing session ownership',
      s => {
        s.session.lengths = s.lengths.slice(1);
      }
    ],
    [
      'overlapping ranges',
      s => {
        s.session.laps.push({ ...s.lap });
      }
    ],
    [
      'duplicate in another session',
      s => {
        const duplicate = { ...s.lengths[0], start_time: time(200) };
        s.file.lengths.push(duplicate);
        s.file.sessions.push({
          ...s.session,
          start_time: time(200),
          timestamp: time(290),
          lengths: [duplicate],
          laps: []
        });
      }
    ],
    [
      'outside lap interval',
      s => {
        s.lap.timestamp = time(29);
      }
    ],
    [
      'outside session interval',
      s => {
        s.session.timestamp = time(29);
      }
    ],
    [
      'open water without a pool',
      s => {
        s.session.sub_sport = 'open_water';
        delete s.session.pool_length;
      }
    ],
    [
      'non-swimming sport with lengths',
      s => {
        s.session.sport = 'running';
      }
    ]
  ];
  it.each(endpointRejections)('does not repair an endpoint with %s', (_name, modify) => {
    const source = fixture();
    modify(source);
    expect(getPoolLengthEvidence(source.file, read).ends.has(source.lengths[0])).toBe(false);
  });

  it('recognizes numeric enums and pool evidence without a sub-sport', () => {
    const source = fixture();
    source.session.sport = 5;
    delete source.session.sub_sport;
    source.lengths.forEach(length => {
      length.length_type = 1;
    });
    expect(getPoolLengthEvidence(source.file, read).ends.size).toBe(2);
  });

  it('detects missing active source lengths without rewriting totals or the source list', () => {
    const { file, session } = fixture(true),
      before = JSON.stringify(file);
    expect(getPoolLengthEvidence(file, read).incompleteSessions.has(session)).toBe(true);
    expect(JSON.stringify(file)).toBe(before);
  });

  const counterRejections: Array<[string, (s: Source) => void]> = [
    [
      'absent active count',
      s => {
        delete s.lap.num_active_lengths;
      }
    ],
    [
      'conflicting active count',
      s => {
        s.lap.num_active_lengths = 2;
      }
    ],
    [
      'fractional active count',
      s => {
        s.lap.num_active_lengths = 2.5;
      }
    ],
    [
      'duplicate index',
      s => {
        s.lengths[2].message_index = { value: 1 };
      }
    ],
    [
      'unindexed source member',
      s => {
        delete s.lengths[2].message_index;
      }
    ],
    [
      'unknown length type',
      s => {
        s.lengths[2].length_type = 'unknown';
      }
    ],
    [
      'incomplete raw range',
      s => {
        s.file.lengths.pop();
      }
    ],
    [
      'fractional range count',
      s => {
        s.lap.num_lengths = 3.5;
      }
    ],
    [
      'negative range start',
      s => {
        s.lap.first_length_index = -1;
      }
    ],
    [
      'overlap in another session',
      s => {
        s.file.sessions.push({ ...s.session, laps: [{ ...s.lap, first_length_index: 2, num_lengths: 1 }] });
      }
    ],
    [
      'open water without a pool',
      s => {
        s.session.sub_sport = 'open_water';
        delete s.session.pool_length;
      }
    ],
    [
      'non-swimming sport',
      s => {
        s.session.sport = 'running';
      }
    ]
  ];
  it.each(counterRejections)('abstains from the new counter guard for %s', (_name, modify) => {
    const source = fixture(true);
    modify(source);
    expect(getPoolLengthEvidence(source.file, read).incompleteSessions.has(source.session)).toBe(false);
  });

  it('does not treat a missing rest as missing active distance', () => {
    const source = fixture(true);
    source.lengths[2].length_type = 'idle';
    source.lap.num_active_lengths = 2;
    expect(getPoolLengthEvidence(source.file, read).incompleteSessions.size).toBe(0);
  });

  it('keeps other sessions eligible when one has incomplete source lengths', () => {
    const missing = fixture(true),
      valid = fixture();
    valid.lengths.forEach(length => {
      length.message_index.value += 3;
    });
    valid.lap.first_length_index = 3;
    const proof = getPoolLengthEvidence(
      { sessions: [missing.session, valid.session], lengths: [...missing.lengths, ...valid.lengths] },
      read
    );
    expect([...proof.incompleteSessions]).toEqual([missing.session]);
    expect(proof.ends.get(valid.lengths[0])).toEqual(time(30));
  });
});
