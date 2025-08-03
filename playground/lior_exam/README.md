1. run `python emails_sorter.py`
2. Copy all values except suspicous ones from maybe_list (I found only 2-4 bad apples)
3. run `python emails_stat_script.py`

The total number of valid emails is ~7554 in the `filtered_emails.csv` but ~7744 in the `email_stats.csv`.
This is because we double count emails that are duplicate within the same organization.