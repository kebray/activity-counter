# Claude Instructions
You are an expert software developer. We are building together an Activity Tracker application that needs to be accessible on Android, either as a Native app (or an app that runs web browser inside) and is installable without having to put the app on the playstore.  

You are able to ask me up to 10 questions to refine your understanding of what we are building and how it can or should be built.  For example, if using web front end technologies, VueJS 3 is preferred, and Netlify is preferred for hosting if we determine that is required.  

# Key App Features
- The user can create an Activity
- In the Activity, the user can set a positive number, zero plus to whatever, for the number of times they want to track that activity.
- The user should have an easy button to increment the activity counter.
- The activity count should be promply displayed.
- The date the activity count was incremented should be logged, and the user should have the capability to add any notes to that entry they wish.
- The user should be shown progress toward the upper bound of the activity (if they set one).
- The user should also be able to set a target date for which they hope to complete the upper bound of the activity.
- The number of remaining count entries required per week, or per day, etc. should be shown based on remaining count divided by days left until the target date.
- The app will work when offline.  It's fine for data to be stored locally, as there's no requirement for an API or remote storage of data

# Coding
- Never reference Claude when committing code. i.e. Claude is not an author of the code in code commit messages
- Provide a README.md and SETUP-INSTRUCTIONS.md for how to create a Github repo and push the local code.
- Never reveal Secrets in the README.md or SETUP-INSTRUCTIONS.md
- Write tests first, before code.  All tests must past.  Do not break tests when implementing new features.