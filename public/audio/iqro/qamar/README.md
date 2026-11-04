# Qamar Apps audio for Iqro 1

These 28 short fathah clips were adapted from lesson 4 of **Al Qaida Al Nooraniya by Qamar Apps**, recited by **Mufti Ghiyas** (the name in the MP3 metadata). The source files are `assets/www/book/Audio/default/04003.mp3` through `04030.mp3` in the Qamar Apps Android publication `com.qamarapps.nooraniarab`. Their association with each letter was checked against `book/Html/005.html` and `006.html` and the corresponding printed pages.

Each published file is a time excerpt of the first, fathah phrase from its source recording; the original lesson has multiple vowel readings. Excerpts were converted to MP3 for the Iqro 1 cards. The original full recordings and the APK are not included here.

Source and publisher: https://www.qamarapps.com/

License: [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). The license declaration is also included in the application's `book/Pages/aboutus.html`. Adapted audio is shared under the same license. The license does not imply Qamar Apps endorses this project.

Regenerate the excerpts from a local copy of the APK with `python3 scripts/extract_qamar_iqro1.py qamar-nooraniya.apk` (requires `mpg123` and `lame`). The exact source IDs and cut times are recorded in that script.

The غَ card uses `gho.mp3`, cut from source `04007.mp3`. Its previous clip, `04006.mp3`, belongs to the neighboring ح group on the source page. Other cards retain their existing recordings.
