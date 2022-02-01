# Betterer TypeScript Chatops
This repository is a Demo that shows how to use Betterer Github Action in a way that improves Developer Experience. This means that you no longer need to run Betterer before commit.

## Example of PR messages
<img width="939" alt="CleanShot 2022-01-31 at 19 31 33@2x" src="https://user-images.githubusercontent.com/5477821/151851970-3d636d09-1a17-4da6-a081-40b5400bae57.png">

<img width="797" alt="CleanShot 2022-01-31 at 18 47 53@2x" src="https://user-images.githubusercontent.com/5477821/151845933-08efcb00-44b3-49bf-917c-eaf537257eb1.png">

## Example of CI job results
<img width="948" alt="CleanShot 2022-01-31 at 18 49 54@2x" src="https://user-images.githubusercontent.com/5477821/151847967-1a1f2b82-bdcb-46a1-bb37-4770c9c9245f.png">

# How does this workflow look like:
1. Commit new typescript changes
2. CI/CD github action uses `Betterer Github Action` to run Betterer that compiles TypeScript with stricter settings
3. If there are changes detected during compilation by Betterer (that means - fixed or new TS offences), custom reporter:
   - prints summary of those changes
   - prints information about the whole initiative of improving TS practices
   - prints information about ways to proceed right now, that is:
      - ✅ **Fix the issues**: Developer can fix new issues he has added right now;
      - ⚠️ **Update results file**: Or, Developer can accept new offences as something we can live with right now, by adding comment with `betterer:update` text into Pull Request. This comment will trigger following events:
          - new CI job is triggered
          - that CI job runs Betterer with `--update` flag
          - which generates new `betterer.results` file that contains current state of TS offences
          - commits this file to current branch
          - sends PR comment that gives nice summary of changes (amout of fixed/added issues)

# How to set it up in your project
1. Create new branch in repository of your project
2. Copy **`.betterer.results`** file to repository/directory of your project
3. Copy **`.betterer.ts`** file to repository of your project
4. Search for **`<--- Adapt to your project needs`** text in it and update those places to your project needs
5. Copy **`.github/workflows/betterer--your-project-name.yml`** file to repository/directory of your project
6. Rename file name to use your project name in it
7. Search for **`<--- Adapt to your project needs`** text in it and update those places to your project needs
8. Copy **`.github/workflows/betterer-chatops--your-project-name.yml`** file to repository/directory of your project
9. Rename file name to use your project name in it
10. Search for **`<--- Adapt to your project needs`** text in it and update those places to your project needs
11. Copy **`.betterer.results`** file to repository/directory of your project
12. Merge those changes to master/main branch (only then all Github Actions will work)
13. Create new branch in repository of your project
14. Edit any TS or TSX file
15. Commit this change
16. Create PR out of this branch
17. Wait for Betterer CI job to fail
18. Add comment into this PR with text **`yourprojectname:betterer:update`** (in this demo the command is **`platform:betterer:update`**)
19. Wait for BOT message in PR that shows that **`.betterer.results`** file was updated
20. Thats it :)
