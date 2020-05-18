Tasera Scheduling Software.

Program for management and scheduling of Tasera managed shooting ranges in Pirkanmaa area.

---- How to run the application (development) ----
1. run npm install at root
2. run npm install at /front
3. run npm run dev at root
4. The program should start up


---- How to run the application (production) ----
1. run npm install at root
2. run npm install at /front
3. run npm run build at root
(1-3. alternative) use following in root:
npm install && cd front && npm install && cd .. && npm run build 

4. restart the server with following:
sudo systemctl disable tasera-scheduling-software.service
sudo ln -s /var/www/tasera-scheduling-software/systemd/tasera-scheduling-software.service /etc/systemd/system/
sudo systemctl enable tasera-scheduling-software.service
sudo systemctl start tasera-scheduling-software.service
sudo systemctl restart tasera-scheduling-software.service

