import MySQLdb

def main():
	db = MySQLdb.connect(host='localhost', user='root', passwd='', db='my_db')
	cur = db.cursor()
	
	print 'connection made'
	
	tripID = 1
	speed = 66
	rpm = 666
	
	
	
	cur.execute("insert into speedinfo values(1, %s, %s, now())", (speed, rpm))
	db.commit()
	
	cur.execute('select * from speedinfo')
	rows = cur.fetchall()
	for row in rows:
		for col in row:
			print "%s," % col
		print "\n"
	
if __name__ == '__main__':
	main()

