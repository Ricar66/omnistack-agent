# Cross-Platform Mobile

> Building one codebase that ships to both iOS and Android. A productivity multiplier when your UI and logic are shareable — and a tax when you need deep platform integration.

## Concepts

- **Native vs. cross-platform:** *native* (Swift/SwiftUI on iOS, Kotlin/Jetpack Compose on Android)
  gives the best performance, latest-API access, and platform feel — at the cost of two codebases.
  *Cross-platform* shares one codebase across both, trading some of that for speed of delivery.
- **The main frameworks:**
  - **React Native** — JavaScript/TypeScript + React; renders real native widgets. Best if your team
    already knows React/web.
  - **Flutter** — Dart; draws its own pixels with a fast rendering engine for highly consistent,
    custom UI across platforms.
  - **.NET MAUI** — C#/XAML; native controls on a shared .NET codebase. Best for .NET/C# teams.
- **Shared concerns** every mobile app handles regardless of framework: **navigation** (stack/tab
  flows), **state management**, **offline support** + sync, **push notifications**, and an **embedded
  database** (SQLite is the universal local store).

## Best Practices

- Choose the framework by your team's existing skills and the UI's nature (custom-drawn → Flutter;
  React shop → React Native; .NET shop → MAUI).
- Design for offline first on mobile networks: cache locally (SQLite), queue writes, sync on reconnect.
- Keep platform-specific code behind a thin abstraction so the shared core stays portable.
- Treat push, deep links, and permissions as first-class — they differ per OS and need real testing on
  devices.

## Patterns & Examples

```text
Cross-platform app — typical layered shape:

  ┌──────────────────────────────────────────┐
  │  UI (RN / Flutter / MAUI widgets)         │  ← shared, ~80–95%
  ├──────────────────────────────────────────┤
  │  State + navigation + domain logic        │  ← shared
  ├──────────────────────────────────────────┤
  │  Local store (SQLite)  ·  API client      │  ← shared, with sync/offline queue
  ├──────────────────────────────────────────┤
  │  Native bridges: push, camera, biometrics │  ← thin per-platform layer
  └──────────────────────────────────────────┘
```

**When native wins:** graphics-/compute-heavy apps (games, AR), apps that must adopt new OS APIs on
day one, or features needing deep platform integration (advanced widgets, complex background work).
For most CRUD/business apps, cross-platform ships faster with little downside.

## Common Pitfalls / Anti-patterns

- **Assuming "write once, run anywhere":** UI conventions, permissions, and lifecycles differ per OS;
  budget for platform-specific tweaks and on-device testing.
- **Ignoring offline:** a mobile app that white-screens on a flaky network. Cache and queue.
- **Heavy bridge traffic:** chatty calls across the native bridge (React Native) stall the UI thread;
  batch and move heavy work native.
- **Skipping real-device testing:** simulators hide performance, gesture, and notification issues.

## References

- React Native documentation — https://reactnative.dev/
- Flutter documentation — https://docs.flutter.dev/
- .NET MAUI documentation — https://learn.microsoft.com/dotnet/maui/

<!-- level: beginner -->
