# i27CoreHR — Local Laptop Setup

By the end of this guide you will have the i27CoreHR portal running on your own laptop and you will
be able to log in as an HR Admin, a Manager and an Employee.

## What you are building

i27CoreHR has three parts: a **frontend** (React, the screens you click on), a **backend** (Spring
Boot, the business logic and login) and a **database** (MySQL). The backend build also builds the
frontend, so on your laptop it runs as two programs:

```text
 Browser  ──►  Backend (Spring Boot)  http://localhost:8080   serves the React screens + the /api calls
                    │  SQL
                    ▼
               Database (MySQL 8)     localhost:3306          where employees, leaves and documents are stored
```

You will set them up from the bottom up: tools first, then the database, then the backend.

---

## Steps at a glance

| Step | What you do | Why |
|---|---|---|
| 1 | Install the tools and check their versions | Every later step depends on these |
| 2 | Get the source code and open it in VS Code | So you know where each part of the app lives |
| 3 | Install MySQL, create the database and an app user | The backend needs an empty database and its own login to store data |
| 4 | Put the DB login in `.env.local` and start the backend | The backend reads its settings from environment variables, then creates the tables and demo users |
| 5 | Log in as each role and run one leave + one document flow | Proves the whole chain works: browser → backend → MySQL → disk |
| 6 | Run it as one app: build a single jar and run it | The same jar you will deploy to EC2 and package into a container |

> **All commands in this guide are Linux (bash) commands.** On Windows you run them in **Git Bash**
> (installed with Git in Step 1) inside VS Code. You'll later deploy the same app to AWS Linux
> servers and containers, where these exact commands work too.
> Only the software installers in Steps 1 and 3 are Windows-specific.

---

## Step 1 — Install the tools

### What we are doing

You are installing four tools to build and run the app, plus an editor to look at and change the
code. Each one has a specific job:

| Tool | Version | What it is used for in this project |
|---|---|---|
| **Git** | any recent | Gives you **Git Bash**, the Linux-style terminal every command in this guide runs in. Later also used to clone code. |
| **Java JDK** | **21** | The backend is written in Java 21. The JDK compiles and runs it. A JRE alone is not enough. |
| **Maven** | 3.8+ | The backend's build tool. It downloads the Java libraries and starts the backend. |
| **Node.js** | **20+** (LTS) | Runs the frontend. It comes with `npm`, which installs the React libraries. |
| **VS Code** | latest | The editor for opening the project, editing files like `.env.local`, and running Git Bash in its built-in terminal. |

MySQL is not here because Step 3 covers it.

### 1.1 Install

Install them in this order. Keep the default options in each installer unless a note below says
otherwise.

1. **Git** — https://git-scm.com/downloads → **Windows** → *64-bit Git for Windows Setup*.
   Keep all the defaults. This installs **Git Bash**.
2. **Java JDK 21** — https://adoptium.net (choose *Temurin 21 LTS*, `.msi` installer)
   - In the installer, turn on **"Set JAVA_HOME variable"** and **"Add to PATH"**. Both are off by
     default.
3. **Maven 3.9.16** — Maven has no installer. You download a zip, extract it, and add its `bin`
   folder to PATH.
   1. Download the zip:
      https://dlcdn.apache.org/maven/maven-3/3.9.16/binaries/apache-maven-3.9.16-bin.zip
   2. Right-click the downloaded zip → **Extract All...**
   3. Click **Browse**, select `C:\`, click **Make new folder**, name it `tools`, select it, and
      click **Extract**.
   4. You should now have `C:\tools\apache-maven-3.9.16`. Inside it is a `bin` folder that contains
      `mvn`. Copy this path: `C:\tools\apache-maven-3.9.16\bin`
   5. Add that path to PATH:
      - Start → search **"Edit the system environment variables"** → open it
      - Click **Environment Variables...**
      - Under **System variables**, select **Path** → click **Edit...**
      - Click **New** and paste `C:\tools\apache-maven-3.9.16\bin`
      - Click **OK** → **OK** → **OK** to close all three windows

   > **Why PATH?** PATH is the list of folders the terminal searches when you type a command.
   > Adding Maven's `bin` folder is what makes `mvn` work. Linux has exactly the same idea:
   > `echo $PATH` shows it.

4. **Node.js 20 LTS or newer** — https://nodejs.org
   1. On the home page, click the **LTS** download. This gives you the Windows `.msi` installer.
   2. Run the installer and click **Next** through the screens, keeping the defaults. The installer
      adds Node and `npm` to PATH for you.
   3. If you see a checkbox for **"Automatically install the necessary tools"** (Chocolatey and
      build tools), leave it **unchecked**. This project doesn't need them.
   4. Click **Install** → **Finish**.

5. **VS Code** — https://code.visualstudio.com
   1. Click **Download for Windows** and run the installer (*User Installer* is fine).
   2. On the **Select Additional Tasks** screen, tick:
      - **Add "Open with Code" action to Windows Explorer file context menu**
      - **Add "Open with Code" action to Windows Explorer directory context menu**
      - **Add to PATH** (usually ticked already)

      The first two let you right-click a folder and choose **Open with Code**. **Add to PATH** makes
      the `code` command work in a terminal.
   3. Click **Install** → **Finish**.

### 1.2 Make Git Bash the terminal in VS Code

1. Open VS Code.
2. Press `Ctrl+Shift+P`, type **Terminal: Select Default Profile**, press Enter, and choose
   **Git Bash**.
3. Open a terminal: **Terminal → New Terminal** (or `` Ctrl+` ``). The tab on the right of the
   terminal panel should say **bash**, and the prompt ends with `$`.

> **Changed PATH, but a command is still "not found"?** VS Code passes PATH to its terminals when
> VS Code itself starts. After any PATH change, **close VS Code completely and open it again**.
> A new terminal tab alone is not enough.

### 1.3 Check that everything works

In the VS Code Git Bash terminal, run:

```bash
git --version
java -version
echo $JAVA_HOME
mvn -version
node -v
npm -v
code --version
```

What you should see (your exact numbers can be higher):

```text
git version 2.4x.x.windows.x
openjdk version "21.0.x"
C:\Program Files\Eclipse Adoptium\jdk-21.0.x.x-hotspot\
Apache Maven 3.9.16 ... Java version: 21.0.x
v20.x.x   (or v22.x.x)
10.x.x
1.9x.x    (VS Code version, followed by two more lines)
```

---

## Step 2 — Get the code and open it in VS Code

1. Right-click `i27hr-app.zip` → **Extract All...** → **Extract**.
2. Open the extracted folder, right-click the inner **`i27hr-app`** folder (the one that contains
   `backend` and `frontend`) → **Open with Code**.
3. If VS Code asks *"Do you trust the authors of the files in this folder?"*, click **Yes, I trust
   the authors**.
4. Open the terminal with `` Ctrl+` `` and check you are in the right folder:

```bash
ls
```

```text
backend  database  Dockerfile  frontend  local-setup.md  sample-documents
```

---

## Step 3 — Install MySQL and create the database

### What we are doing

The backend stores everything (employees, logins, leave requests, document details) in MySQL. In
this step you will:

1. Install **MySQL 8.4** and run it as a Windows service, so it starts with the machine
2. Create an empty database called **`i27corehr`**
3. Create a MySQL user called **`i27corehr`** that the app uses to log in

**Why create the database by hand?** The backend connects to a database named `i27corehr` and
does not create it if it's missing. It *does* create all the **tables** on its first start, so an
empty database is all you need. You never run `database/schema.sql` yourself.

**Why a separate user instead of `root`?** `root` can do anything on the whole server. The app only
needs its own database, so it gets a user that can only touch `i27corehr`. You'll see the same idea
later with IAM roles in AWS: give each thing only the access it needs.

Passwords used in this guide (dev/practice only, never reuse them for anything real):

| MySQL user | Password | Used by |
|---|---|---|
| `root` | `Root_Dev_2026` | You, for admin work |
| `i27corehr` | `I27hr_Dev_2026` | The i27CoreHR backend |

### 3.1 Install MySQL Server

**First, install the Microsoft Visual C++ Redistributable.** MySQL for Windows is built with
Microsoft's C++ tools and needs their runtime libraries. Without them, the MySQL installer stops
with *"This application requires Visual Studio 2019 x64 Redistributable"*.

1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
   This is Microsoft's official link to the latest **Visual C++ 2015–2022 x64** package. One
   package covers 2015, 2017, 2019 and 2022, so it satisfies the "2019" requirement.
2. Run it, tick **I agree to the license terms**, and click **Install** → **Close**.
   If it says **Repair / Uninstall** instead, it's already installed: click **Close**.
3. If the MySQL installer was open with the error, close it and run the MySQL MSI again.

**Then install MySQL:**

1. Go to https://dev.mysql.com/downloads/mysql/
2. Select **8.4.x LTS** and **Microsoft Windows**, then download the **MSI Installer**. On the next
   page, click **No thanks, just start my download**.
3. Run the MSI and choose **Typical** → **Install**. On the last screen, keep **Run MySQL
   Configurator** ticked and click **Finish**.
4. In **MySQL Configurator**:
   1. **Type and Networking:** Config Type **Development Computer**, TCP/IP port **3306**. Leave
      everything else as it is.
   2. **Accounts and Roles:** set the root password to `Root_Dev_2026`. Don't add users here,
      you'll do that with SQL in 3.4 so you can see how it works.
   3. **Windows Service:** keep **Configure MySQL Server as a Windows Service** and **Start the
      MySQL Server at System Startup** ticked. The service name is `MySQL84`.
   4. Click **Next** / **Execute** through the remaining screens, then **Finish**.

### 3.2 Put the `mysql` command on PATH

The installer doesn't add the `mysql` command-line client to PATH. Add it the same way you added
Maven in Step 1:

- Path to add: `C:\Program Files\MySQL\MySQL Server 8.4\bin`
- Start → **Edit the system environment variables** → **Environment Variables...** → under
  **System variables** select **Path** → **Edit...** → **New** → paste → **OK** → **OK** → **OK**

**Close VS Code completely and open it again**, so its terminal picks up the new PATH. Then check:

```bash
which mysql
mysql --version
```

Expected:

```text
/c/Program Files/MySQL/MySQL Server 8.4/bin/mysql
mysql  Ver 8.4.x for Win64 on x86_64 (MySQL Community Server - GPL)
```

### 3.3 Look at what's already there

Log in as root. The password goes right after `-p`, **with no space**:

```bash
mysql -u root -pRoot_Dev_2026
```

MySQL prints `Warning: Using a password on the command line interface can be insecure.` That's
fine on your own laptop with practice passwords. On a shared or real server you would type just
`-p` and enter the password when asked, so it isn't saved in your shell history.

You are now at the `mysql>` prompt. First look at what exists on a fresh server:

```sql
SHOW DATABASES;
SELECT user, host FROM mysql.user;
```

You should see only MySQL's own databases (`information_schema`, `mysql`, `performance_schema`,
`sys`) and its own users (`root`, `mysql.session`, `mysql.sys`, `mysql.infoschema`). There is no
`i27corehr` yet. If there is one, someone already did this step on this machine. The commands
below use `IF NOT EXISTS`, so they're safe to run again.

### 3.4 Create the database and the app user

Still at the `mysql>` prompt:

```sql
-- 1. The empty database. utf8mb4 stores every language and emoji correctly.
CREATE DATABASE IF NOT EXISTS i27corehr CHARACTER SET utf8mb4;

-- 2. The app's own user. 'localhost' means it can only connect from this machine.
CREATE USER IF NOT EXISTS 'i27corehr'@'localhost' IDENTIFIED BY 'I27hr_Dev_2026';

-- 3. Full rights on the i27corehr database only. Nothing else on the server.
GRANT ALL PRIVILEGES ON i27corehr.* TO 'i27corehr'@'localhost';

-- 4. Check
SHOW DATABASES;
SHOW GRANTS FOR 'i27corehr'@'localhost';

EXIT;
```

`SHOW GRANTS` should print two lines: `GRANT USAGE ON *.* ...` (this only means "can log in") and
`GRANT ALL PRIVILEGES ON `i27corehr`.* ...`.

### 3.5 Log in as the app user

This is exactly what the backend will do:

```bash
mysql -u i27corehr -pI27hr_Dev_2026 i27corehr
```

```sql
SELECT DATABASE(), CURRENT_USER();
SHOW TABLES;
EXIT;
```

Expected: `i27corehr | i27corehr@localhost`, and `SHOW TABLES` prints **`Empty set`**. That's
right: the tables appear after the backend's first start in Step 4.

---

## Step 4 — Configure and start the backend

### What we are doing

The backend needs to know how to reach MySQL: host, port, database, user and password. It does
**not** read these from a file. It reads them from **environment variables**, the named values
that every program inherits from the program that starts it.

You can see this in `backend/src/main/resources/application.yml`:

```yaml
url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:i27corehr}...
username: ${DB_USERNAME:root}
password: ${DB_PASSWORD:}
```

`${DB_PASSWORD:}` means "use the environment variable `DB_PASSWORD`, and if it isn't set, use
what comes after the colon" (here: empty). Nothing is hard-coded, so the same code runs on your
laptop, an EC2 server or a container. Only the variables change. This idea comes back throughout
the AWS labs.

You keep your values in `backend/.env.local`, and the script `backend/mvn-local.sh` turns them into
environment variables before it starts Maven:

```text
.env.local  ──(mvn-local.sh loads it)──►  environment variables  ──►  mvn spring-boot:run  ──►  backend  ──►  MySQL
```

### 4.1 Put your DB login in `.env.local`

In VS Code, open `backend/.env.local` and set these two lines to the user you created in Step 3:

```properties
DB_USERNAME=i27corehr
DB_PASSWORD=I27hr_Dev_2026
```

Save the file (`Ctrl+S`). Leave the other lines as they are. Each one is explained in
`backend/.env.example`. Rules for this file: `KEY=value`, one per line, **no spaces around `=`**.

> `.env.local` holds a password, so it's listed in `.gitignore` and never goes into Git.
> `.env.example` is the shareable template with no real secrets.

### 4.2 What `mvn-local.sh` does

Open `backend/mvn-local.sh` in VS Code. The important lines are:

```bash
cd "$(dirname "${BASH_SOURCE[0]}")"      # go to the backend folder, wherever you run it from

set -a                                   # export every variable defined from here on
source <(sed 's/\r$//' .env.local)       # read KEY=value lines (and drop Windows line endings)
set +a                                   # stop auto-exporting

exec mvn "$@"                            # run Maven with whatever you typed after the script name
```

So `./mvn-local.sh spring-boot:run` is the same as typing all the `export DB_HOST=...` lines
yourself and then `mvn spring-boot:run`. The variables only exist for that Maven process. They
don't stay in your terminal afterwards, so you can't accidentally leak them into other programs.

### 4.3 Start the backend

```bash
cd backend
./mvn-local.sh spring-boot:run
```

The first line printed is from the script, confirming what it loaded:

```text
Loaded .env.local -> DB i27corehr@localhost:3306/i27corehr
```

What happens next:

1. **Maven downloads the libraries** listed in `pom.xml` (Spring Boot, MySQL driver, AWS SDK...)
   into `~/.m2/repository`.
2. **It builds the frontend.** `pom.xml` downloads its own Node.js into `target/frontend-tools`,
   runs `npm install` and `npm run build` in `../frontend`, and copies the result into
   `target/classes/static`. You'll see `[INFO] --- frontend-maven-plugin ...` and npm output scroll by.
3. **It compiles** the Java code in `src/main/java`.
4. **It starts the app.** The app connects to MySQL with your variables, **creates the tables**
   (`ddl-auto: update` in `application.yml`), and **adds 3 demo users**. It serves both the
   screens and the API on port 8080.

**The first run takes 5–15 minutes** depending on your internet, because of all the downloads.
Later runs reuse them and start in under a minute.

It is ready when you see lines like these near the end:

```text
... Seeding baseline i27CoreHR accounts...
... Baseline seed complete: 3 employees.
... Demo login — i27-0001 / priya.rao@i27academy.com (HR Admin), i27-0002 / arjun.reddy@i27academy.com (Manager), i27-0003 / rahul.sharma@i27academy.com (Employee) — password: Passw0rd!
... Tomcat started on port 8080 (http) with context path '/'
... Started I27CoreHrApplication in 6.5 seconds
```

**Leave this terminal running.** The backend runs as long as this terminal is open. Press
`Ctrl+C` to stop it.

> The seeding lines only appear on the **first** start. After that you'll see
> `Employees already present — skipping baseline seed.` That's expected: the seeder only runs when
> the `employees` table is empty, so it never overwrites your data.

### 4.4 Check it from outside

Open a **second** terminal (the `+` in the VS Code terminal panel).

**1. Health check:**

```bash
curl http://localhost:8080/actuator/health
```

```json
{"status":"UP"}
```

**2. The tables now exist.** Log in as the app user:

```bash
mysql -u i27corehr -pI27hr_Dev_2026 i27corehr
```

```sql
SHOW TABLES;
SELECT employee_code, first_name, last_name, email FROM employees;
EXIT;
```

In Step 3, `SHOW TABLES` said `Empty set`. Now the backend has created 6 tables:

```text
activity_log
employee_documents
employees
leave_balances
leave_requests
users
```

and `employees` has the 3 demo people: Priya Rao, Arjun Reddy and Rahul Sharma.

**3. The screens.** Open **http://localhost:8080** in the browser. You get the i27CoreHR login page:
the backend serves the built frontend from `target/classes/static`. Log in as
`priya.rao@i27academy.com` / `Passw0rd!` to confirm the whole chain works:
browser → backend → MySQL.

---

## Step 5 — Log in as each role and try the main flows

### What we are doing

The app has three roles, and the backend enforces what each one may do. Hiding a menu item isn't
enough; the API itself refuses. On first start the backend created one user per role, all with
the password **`Passw0rd!`**:

| Role | Employee code | Email | Reports to |
|---|---|---|---|
| HR Admin | `i27-0001` | `priya.rao@i27academy.com` | — |
| Manager | `i27-0002` | `arjun.reddy@i27academy.com` | — |
| Employee | `i27-0003` | `rahul.sharma@i27academy.com` | Arjun Reddy |

Use http://localhost:8080. Use **Sign out** at the bottom of
the left menu to switch users.

### 5.1 Each role sees a different menu

Log in as each user and compare the left menu:

| Menu item | HR Admin (Priya) | Manager (Arjun) | Employee (Rahul) |
|---|---|---|---|
| Dashboard | ✔ | ✔ | ✔ |
| Employees | ✔ all employees | ✔ shown as **My Team** | ✘ |
| Leave | ✔ all requests, can approve | ✔ team's requests, can approve | ✔ apply and track own |
| Documents | ✔ can upload | ✔ | ✔ own documents |
| My Profile | ✔ | ✔ | ✔ |

### 5.2 Leave flow: Employee applies → Manager approves

1. **As Rahul (Employee):** **Leave** → in **Apply for leave**, pick **Casual**, a date range on
   working days, type a reason → **Submit request**. The request shows as *Pending*. Note the
   Casual leave balance.
2. **Sign out → as Arjun (Manager):** the **Leave** menu item shows a count badge. Open **Leave**,
   select Rahul's request → **Approve** → confirm.
3. **Sign out → as Rahul:** the request is *Approved* and the Casual balance has gone down by the
   number of working days.

Now look at it in the database:

```bash
mysql -u i27corehr -pI27hr_Dev_2026 i27corehr
```

```sql
SELECT id, leave_type, start_date, end_date, status, reviewed_at FROM leave_requests;
SELECT leave_type, total_days, used_days FROM leave_balances WHERE employee_id = 3;
EXIT;
```

The request is `APPROVED`, and Casual `used_days` matches what the screen showed.

### 5.3 Document flow: HR uploads → Employee downloads

1. **As Priya (HR Admin):** **Documents** → **Upload document** → Employee: **Rahul Sharma**,
   pick a category (e.g. *Offer letter*), choose a file from the `sample-documents` folder (e.g.
   `Offer_Letter_Rahul_Sharma.pdf`) → upload. The table below lists a file for every category.
2. **Sign out → as Rahul:** **Documents** shows the file, and he can download it.

Test files in `sample-documents/` (all marked as sample training data):

| File | Upload for | Category | What it tests |
|---|---|---|---|
| `Offer_Letter_Rahul_Sharma.pdf` | Rahul Sharma | Offer letter | PDF |
| `Payslip_Oct_2026_Rahul_Sharma.pdf` | Rahul Sharma | Payslip | PDF |
| `Employee_ID_Card_i27-0003.png` | Rahul Sharma | ID proof | PNG |
| `Appraisal_2026_Rahul_Sharma.docx` | Rahul Sharma | Appraisal | DOCX |
| `Leave_Policy_2026.pdf` | anyone | Policy document | PDF |
| `Experience_Letter_Arjun_Reddy.docx` | Arjun Reddy | HR letter | DOCX, a second employee's folder |
| `Laptop_Allocation_Form.pdf` | Rahul Sharma | Other | PDF |
| `Team_Offsite_Notice.png` | anyone | Other | PNG |
| `not_allowed_file_type.txt` | anyone | any | **Should be rejected**: only PDF, DOCX and PNG are allowed |

Where did the file go? With `DOCUMENT_STORAGE_TYPE=local` in `.env.local`, files are saved under
`DOCUMENT_LOCAL_PATH`, relative to the `backend` folder:

```bash
ls -R backend/data/documents
```

```text
backend/data/documents:
i27-0003

backend/data/documents/i27-0003:
Offer_Letter.pdf        <- your file's name; unsafe characters such as spaces are replaced
```

One folder per employee code. The **file** is on disk, but its **details** (name, category, who uploaded it) are in MySQL, in the
`employee_documents` table. Later, in the AWS labs, you switch `DOCUMENT_STORAGE_TYPE` to `s3` and
the same upload goes to an S3 bucket instead, with no code change.

### 5.4 *(Optional)* HR adds an employee

**As Priya:** **Employees** → **Add employee** → fill in the form, with Arjun Reddy as manager →
save. The new person can log in straight away with their email and the default password
`Passw0rd!`.

---

## Step 6 — Run it as one app (single jar)

### What we are doing

In Step 4, `./mvn-local.sh spring-boot:run` built the frontend and ran the app straight from the
`target/classes` folder. That's handy while changing code, but you can't hand a folder of class
files to a server. For a real deployment you want **one file** that contains everything. Here you
build it:

```text
./mvn-local.sh clean package
   1. downloads its own Node.js into backend/target/frontend-tools   (doesn't touch the Node you installed)
   2. npm install + npm run build in ../frontend                      -> frontend/dist
   3. copies frontend/dist into the jar as static files
   4. compiles the backend and packages it all into
      backend/target/i27corehr-backend.jar                            (~70 MB, includes its own web server)

./run-local.sh
   loads .env.local, then: java -jar target/i27corehr-backend.jar    -> UI + API on http://localhost:8080
```

This jar is exactly what you'll later copy to an EC2 instance, or put inside a container image.
Only the environment variables change.

### 6.1 Build

Stop the backend from Step 4 first (`Ctrl+C` in its terminal), because both use port 8080. Then:

```bash
cd backend
./mvn-local.sh clean package
```

The first build takes several minutes, because it downloads Node.js and all the frontend
libraries. Later builds take about 30 seconds. It's done when you see:

```text
[INFO] BUILD SUCCESS
```

Check the result:

```bash
ls -lh target/*.jar
```

### 6.2 Run

```bash
./run-local.sh
```

Wait for `Started I27CoreHrApplication`, then open **http://localhost:8080** in the browser. You
get the login page, served by the same process as the API, on one port.

To stop it, press `Ctrl+C`.

### 6.3 After you change code

The jar is a snapshot. After any change to the backend or frontend code, build again, then run:

```bash
./mvn-local.sh clean package && ./run-local.sh
```

(`&&` means "run the second command only if the first one succeeded".)

---

## Common problems

Find the step you were on, then the message you see.

### Step 1 — Install the tools

| What you see | Cause | Fix |
|---|---|---|
| `bash: mvn: command not found` | Maven's `bin` folder is not on PATH, or VS Code was open when you changed PATH | Re-check the PATH entry, then close and reopen VS Code |
| `java -version` shows 1.8 or 11 | An older Java is earlier in PATH | Move the JDK 21 entry above the old one in PATH, or uninstall the old Java |
| `mvn -version` shows an older Java, or `echo $JAVA_HOME` is empty | `JAVA_HOME` is not set, or points to the old JDK | Set the `JAVA_HOME` system variable to the JDK 21 folder, e.g. `C:\Program Files\Eclipse Adoptium\jdk-21...`, then reopen VS Code |
| No **Git Bash** in *Select Default Profile* | Git isn't installed, or VS Code was open during the install | Install Git, then reopen VS Code |

### Step 3 — Install MySQL and create the database

| What you see | Cause | Fix |
|---|---|---|
| *"This application requires Visual Studio 2019 x64 Redistributable"* | The Microsoft C++ runtime is missing | Install `vc_redist.x64.exe` (start of 3.1), then run the MySQL MSI again |
| `bash: mysql: command not found` | MySQL's `bin` folder is not on PATH, or VS Code was open during the PATH change | Re-check 3.2, then close and reopen VS Code |
| `mysql` seems stuck and shows no `mysql>` prompt | You're in the separate **Git Bash window**, not the VS Code terminal | Use the VS Code terminal, or put `winpty` in front: `winpty mysql -u root -pRoot_Dev_2026` |
| `Enter password:` appears, then `ERROR 1049 (42000): Unknown database 'Root_Dev_2026'` | There is a space between `-p` and the password, so MySQL asked for the password and treated the password as a database name | Write it as `-pPASSWORD`, with no space |
| `ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost:3306'` | The MySQL service is not running | Services → **MySQL84** → **Start** |
| `ERROR 1045 (28000): Access denied for user ...` | Wrong password, or the user wasn't created | Log in as root and run 3.4 again |
| `ERROR 1044 (42000): Access denied ... to database 'i27corehr'` | The `GRANT` line was skipped | Log in as root and run the `GRANT` line from 3.4 |
| Port 3306 already in use during setup | Another MySQL (e.g. XAMPP/WAMP) is already installed | Stop or uninstall the other one, or pick **3307** and use that port in Step 4 |

### Step 4 — Configure and start the backend

| What you see | Cause | Fix |
|---|---|---|
| `WARNING: DB_PASSWORD is empty in .env.local` and then `Access denied ... (using password: NO)` | The password line is empty or the file wasn't saved | Set `DB_PASSWORD=` in `.env.local`, save, run again |
| `Access denied for user 'i27corehr'@'localhost' (using password: YES)` | Wrong password in `.env.local` | Make it match the password from Step 3.4 |
| `Access denied for user 'root'@'localhost'` | You ran plain `mvn spring-boot:run`, so nothing was loaded and the app used the default user `root` | Use `./mvn-local.sh spring-boot:run` |
| `ERROR: backend/.env.local not found` | The file is missing or misnamed | `cp .env.example .env.local`, then fill it in (4.1) |
| `bash: ./mvn-local.sh: Permission denied` | The script isn't marked as executable (Linux/Mac) | `chmod +x mvn-local.sh run-local.sh` |
| `$'\r': command not found` | The `.sh` file was saved with Windows line endings | In VS Code, click `CRLF` in the bottom status bar → choose `LF` → save |
| `Unknown database 'i27corehr'` | The database wasn't created | Do Step 3.4 again |
| `Communications link failure` / `Connection refused` | MySQL is not running, or the wrong port | Services → **MySQL84** → Start; check `DB_PORT=3306` |
| `Web server failed to start. Port 8080 was already in use.` | Another program (or a second backend you started) is on 8080 | Stop the other one, or set `SERVER_PORT=8081` in `.env.local` |
| `release version 21 not supported` / `invalid target release: 21` | Maven is running on an older Java | Check `mvn -version` says Java 21; fix `JAVA_HOME` (see Step 1 in this section) |
| `mvn` downloads fail with `PKIX path building failed` | Antivirus or a company proxy is inspecting HTTPS traffic | Try another network, or ask your trainer |
| Build fails at `install-node-and-npm` / `npm install` | No internet, or antivirus/proxy blocking the Node.js or npm download | Check internet access and retry; ask your trainer if it's a company network |

### Step 6 — Run it as one app (single jar)

| What you see | Cause | Fix |
|---|---|---|
| `ERROR: target/i27corehr-backend.jar not found` | You ran `./run-local.sh` before building | Run `./mvn-local.sh clean package` first |
| `Port 8080 was already in use` | The Step 4 backend is still running | `Ctrl+C` in that terminal, then run again |
| Build fails at `install-node-and-npm` / `npm install` | No internet, or antivirus/proxy blocking the download | Check internet access and retry; ask your trainer if it's a company network |
| The page still shows old content after a code change | You ran the old jar | Build again (6.3) |

