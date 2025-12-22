export function RootSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div
            className="h-6 w-40 rounded-md mb-2"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.15))",
            }}
          />
          <div
            className="h-4 w-64 rounded-md"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 animate-pulse"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex justify-between items-center gap-3 mb-2">
                <div className="flex-1 space-y-2">
                  <div
                    className="h-4 w-2/3 rounded-md"
                    style={{
                      background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
                    }}
                  />
                  <div
                    className="h-3 w-1/2 rounded-md"
                    style={{
                      background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
                    }}
                  />
                </div>
                <div
                  className="h-6 w-16 rounded-full"
                  style={{
                    background: "var(--skeleton-bg, rgba(128,134,139,0.2))",
                  }}
                />
              </div>
              <div
                className="h-8 w-24 rounded-md mt-2"
                style={{
                  background: "var(--skeleton-bg, rgba(128,134,139,0.15))",
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function TournamentSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-pulse">
          <div
            className="h-5 w-32 rounded-md mb-3"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
          <div
            className="h-7 w-2/3 rounded-md mb-2"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
            }}
          />
          <div
            className="h-4 w-1/2 rounded-md"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
        </div>

        <div
          className="rounded-lg p-4 animate-pulse"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div
              className="h-5 w-32 rounded-md"
              style={{
                background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
              }}
            />
            <div
              className="h-9 w-32 rounded-md"
              style={{
                background: "var(--skeleton-bg, rgba(128,134,139,0.22))",
              }}
            />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div
                    className="h-4 w-3/4 rounded-md"
                    style={{
                      background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
                    }}
                  />
                  <div
                    className="h-3 w-1/2 rounded-md"
                    style={{
                      background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
                    }}
                  />
                </div>
                <div
                  className="h-7 w-20 rounded-full"
                  style={{
                    background: "var(--skeleton-bg, rgba(128,134,139,0.2))",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function MatchSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="animate-pulse">
          <div
            className="h-5 w-32 rounded-md mb-3"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
          <div
            className="h-7 w-3/4 rounded-md mb-2"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
            }}
          />
          <div
            className="h-4 w-1/2 rounded-md"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
        </div>

        <div
          className="rounded-lg p-4 animate-pulse"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="h-6 w-24 rounded-md"
              style={{
                background: "var(--skeleton-bg, rgba(128,134,139,0.2))",
              }}
            />
            <div
              className="h-5 w-16 rounded-full"
              style={{
                background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
              }}
            />
          </div>
          <div
            className="h-4 w-32 rounded-md"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
        </div>

        <div
          className="rounded-lg p-4 animate-pulse"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="h-4 w-20 rounded-md mb-3"
            style={{
              background: "var(--skeleton-bg, rgba(128,134,139,0.12))",
            }}
          />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full"
                style={{
                  background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg p-4 animate-pulse"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="h-5 w-24 rounded-md mb-3"
                style={{
                  background: "var(--skeleton-bg, rgba(128,134,139,0.18))",
                }}
              />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((__, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div
                      className="h-3 w-24 rounded-md"
                      style={{
                        background:
                          "var(--skeleton-bg, rgba(128,134,139,0.12))",
                      }}
                    />
                    <div
                      className="h-3 w-10 rounded-md"
                      style={{
                        background:
                          "var(--skeleton-bg, rgba(128,134,139,0.12))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
