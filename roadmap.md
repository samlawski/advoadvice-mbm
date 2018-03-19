0. Revert the TEMP branch (recaptcha and misssing blog posts)

1. Fix `findOrInitializeCurrentQuiz`. Problem: It populates the state before the DOM even has the quiz elements. Maybe use the template to populate it.
2. Make sure the state updates the DOM and vice versa when filling out the forms and switching slides.
3. Fill in all the information for all the other slides.
4. Build a final form to send an email to advoadvice. Compile all quiz results into a single big message string. 

Notes: 
https://blitzerkanzlei.de/kostenlose-beratung-anfordern/
https://www.mailthis.to/

