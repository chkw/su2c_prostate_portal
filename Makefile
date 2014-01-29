# Copies the data_summary webpage to the server.
# https://su2c-dev.ucsc.edu/static/data_summary.html


#TARGET_DIR = /data/medbook-galaxy-central/static
#TARGET_DIR = ~/medbook_sandbox/static
TARGET_DIR = ~/Documents/eclipse_workspace/medbook-galaxy-central/static

test:

deploy:
	rsync -avP data_summary.html $(TARGET_DIR)/. ;
	\
	rsync -avP --exclude="data_summary/data/" --delete-excluded data_summary $(TARGET_DIR)/. ;
	\
	
remove:
	rm -f $(TARGET_DIR)/data_summary.html ;
	\
	rm -rf $(TARGET_DIR)/data_summary/ ;
	\

