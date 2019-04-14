const pool = require('../data/config.js');


const router = app =>{
	app.get('/', (request, response) => {
		response.send({
			message: 'Node/Express REST API'
    		});
  	});


	app.get('/getsessions/', (request, response) => {
	  
  		const sid = request.params.sid;		
			
		//pool.query('SELECT aid, data, time FROM messages WHERE vid=? AND sid=? ORDER BY aid ASC', [vid, sid],  (error,result) => {
			//if(error) throw error;

			//response.send(result);
			
		pool.query('SELECT DISTINCT session_id FROM message',  (error,result) => {
			if(error) throw error;

			response.send(result);
		});
	});
  
  
	app.get('/session/:vid/:sid', (request, response) => {
	  
  		const sid = request.params.sid;
		const vid = request.params.vid;
		
			
		//pool.query('SELECT aid, data, time FROM messages WHERE vid=? AND sid=? ORDER BY aid ASC', [vid, sid],  (error,result) => {
			//if(error) throw error;

			//response.send(result);
			
		pool.query('SELECT arb_id, message, cantime, latitude, longitude FROM message WHERE session_id=?',[sid],  (error,result) => {
			if(error) throw error;

			response.send(result);
	  });
  });

}
module.exports = router;
