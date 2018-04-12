module.exports = {
	ExecRaw : function(sql, req, obj, fnps, fn)
	{
		req.sql.connect(req.config).then(function() {
			var ps = new req.sql.PreparedStatement();
			fnps(req, ps, obj);
			ps.prepare(sql, function(err) {
			    ps.execute(obj, function(err, recordset) {
			        if (err)
			        {
			        	return { error : err};
			        }
			        
			        fn(recordset);
			        ps.unprepare(function(err) {
			            if (err)
				        {
				        	return { error : err};
				        }
			        });
			    });
			});
		});
	},
	GetKey : function(req, res, obj, fn) 
	{
		var sql = "SELECT TOP 1 MyKey,MyValue,Timestamp FROM dbo.MyTable WHERE MyKey=@MyKey ORDER BY Timestamp DESC";
		this.ExecRaw(sql, req, obj, function(req, ps, obj) { 
			ps.input("MyKey", req.sql.VarChar(200)); 
		}, fn);
	},
	GetKeyTimestamp : function(req, res, obj, fn) 
	{
		var sql = "SELECT TOP 1 MyKey,MyValue,Timestamp FROM dbo.MyTable WHERE MyKey=@MyKey AND Timestamp<=@Timestamp ORDER BY Timestamp DESC";
		this.ExecRaw(sql, req, obj, function(req, ps, obj) { 
			ps.input("MyKey", req.sql.VarChar(200)); 
			ps.input("Timestamp", req.sql.DateTime); 
		}, fn);
	}, //this file is done by JohnKenedy (johnkenedy84@yahoo.com)
	InsertOrUpdate : function(req, res, obj, fn)
	{
		if (obj.hasOwnProperty("Timestamp") == false) obj.Timestamp = new Date();
		//var sql = "IF EXISTS(SELECT * FROM dbo.MyTable WHERE MyKey=@MyKey AND Timestamp=@Timestamp) BEGIN UPDATE dbo.MyTable SET MyValue=@MyValue WHERE MyKey=@MyKey AND Timestamp=@Timestamp END ELSE BEGIN INSERT INTO dbo.MyKey(MyKey,MyValue,Timestamp) VALUES(@MyKey,@MyValue,GETDATE()) END"
		var sql = "DECLARE @TM AS DATETIME; SET @TM = GETDATE(); INSERT INTO dbo.MyTable(MyKey,MyValue,Timestamp) VALUES(@MyKey,@MyValue,@TM); SELECT TOP 1 MyKey,MyValue,Timestamp FROM dbo.MyTable WHERE MyKey=@MyKey ORDER BY Timestamp DESC"
		this.ExecRaw(sql, req, obj, function(req, ps, obj) { 
			ps.input("MyKey", req.sql.VarChar(200)); 
			ps.input("MyValue", req.sql.VarChar(req.sql.MaxStringLength)); 
		}, fn);
	}
};