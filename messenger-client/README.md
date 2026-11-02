# Messenger – klient

Klient webowy komunikatora napisany w React, TypeScript i Vite. Łączy się z serwerem BSIUI Messenger przez REST API. Umożliwia rejestrację, logowanie, tworzenie czatów po loginie użytkownika oraz wysyłanie i odbieranie wiadomości.

## Wymagania

- Node.js w wersji 20.19 lub nowszej z linii 20 albo 22.12 lub nowszej (npm jest instalowany razem z Node.js)
- działający serwer BSIUI Messenger (domyślnie na porcie 8000)

Wersję Node.js sprawdzisz poleceniem:

```bash
node --version
```

Jeśli nie masz Node.js, zainstaluj go w sposób właściwy dla swojego systemu.

**Windows** (PowerShell):

```powershell
winget install OpenJS.NodeJS.LTS
```

Po instalacji otwórz nowe okno terminala.

**Linux** (przez [nvm](https://github.com/nvm-sh/nvm)):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

Po instalacji otwórz nowy terminal i zainstaluj Node.js:

```bash
nvm install --lts
```

**macOS** (przez [Homebrew](https://brew.sh)):

```bash
brew install node
```

## Uruchomienie

Wszystkie polecenia wykonuj w katalogu `messenger-client`. Serwer musi działać, zanim zaczniesz korzystać z aplikacji.

### Windows

PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Wiersz polecenia (cmd):

```bat
npm install
copy .env.example .env
npm run dev
```

### Linux i macOS

```bash
npm install
cp .env.example .env
npm run dev
```

Aplikacja będzie dostępna pod adresem <http://localhost:5173>.

## Konfiguracja

Ustawienia znajdują się w pliku `.env`, który tworzysz na podstawie `.env.example`. Plik `.env` nie trafia do repozytorium. Po jego zmianie Vite sam się restartuje.

| Zmienna                 | Domyślnie               | Opis                                                 |
| ----------------------- | ----------------------- | ---------------------------------------------------- |
| `SERVER_URL`            | `http://localhost:8000` | Adres serwera REST API                               |
| `VITE_POLL_INTERVAL_MS` | `3000`                  | Co ile milisekund klient pyta o nowe wiadomości      |

Niepoprawna wartość `VITE_POLL_INTERVAL_MS` (np. tekst, zero lub liczba ujemna) jest zastępowana wartością domyślną.

Zmienne z prefiksem `VITE_` trafiają do kodu wysyłanego do przeglądarki, więc nie umieszczaj w nich żadnych sekretów.

## Polecenia

| Polecenie         | Działanie                                                  |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Uruchamia serwer deweloperski z automatycznym odświeżaniem |
| `npm run build`   | Sprawdza typy i buduje aplikację do katalogu `dist`        |
| `npm run preview` | Uruchamia zbudowaną aplikację pod <http://localhost:4173>  |
| `npm run lint`    | Sprawdza kod za pomocą ESLint                              |

## Połączenie z serwerem

Serwer nie wysyła nagłówków CORS, więc przeglądarka nie może łączyć się z nim bezpośrednio. Klient wysyła żądania pod `/api`, a Vite przekazuje je pod `SERVER_URL`. Działa to w `npm run dev` i `npm run preview`.

Pliki z katalogu `dist` nie zawierają tego przekierowania. Przy wdrożeniu na inny serwer WWW trzeba skonfigurować na nim przekazywanie `/api` do serwera API, z usunięciem prefiksu `/api`, oraz serwowanie `index.html` dla ścieżek takich jak `/login`.

## Rozwiązywanie problemów

### „Nie można połączyć się z serwerem”

1. Sprawdź, czy serwer działa i czy `SERVER_URL` w `.env` wskazuje jego adres.
2. Jeśli klient działa w WSL, a serwer na Windowsie, `localhost` w WSL nie wskazuje Windowsa. Sprawdź adres Windowsa poleceniem poniżej i wpisz go do `SERVER_URL`, np. `http://172.25.176.1:8000`. Adres może się zmienić po restarcie.

   ```bash
   ip route show default | awk '{print $3}'
   ```

   Trwałym rozwiązaniem jest włączenie trybu `networkingMode=mirrored` w pliku `.wslconfig` albo uruchomienie klienta i serwera po tej samej stronie.

### PowerShell blokuje polecenie `npm`

Jeśli pojawia się błąd o wyłączonym uruchamianiu skryptów, użyj wiersza polecenia (cmd) albo zezwól na skrypty dla swojego konta:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Testowanie dwóch użytkowników naraz

Token jest wspólny dla wszystkich kart przeglądarki, więc drugie konto otwórz w oknie incognito albo w innej przeglądarce.
