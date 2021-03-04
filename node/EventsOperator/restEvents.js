const getRestEvents = (db) => (req,res)=>{
  db.select('starttime','endtime','name')
  .from('rests')
  .where('username',req.body.username)
  .then(events => res.send(events));
}

const deleteRestEvents = (db) => (req,res) => {
  db('rests')
  .returning("*")
  .where({
    'name':req.body.DeleteEvent,
    'username':req.body.username
  })
  .del()
  .then(event => res.status(200).json(`Succeed!\nYou have deleted ${event[0].name} successfully`))
  .catch(err => res.status(400).json('Faided to delete the event.\nThis event may not be existed'))
}

const addRestEvents = (db) => (req,res) => {
  db.select("name", "starttime", "endtime")
  .from('fixedevents').where('username',req.body.username)
  .then(fixedevents => {
    fixedevents.forEach(event => {
      if ((req.body.starttime >= event.starttime && req.body.starttime <= event.endtime)
        || (req.body.endtime <= event.endtime && req.body.endtime >= event.starttime)) {
        return res.status(400).json(`Unable to add the event.\nIt has time conflict with the Fixed Event: ${event.name}`)
      }
    })
    db.select("name", "starttime", "endtime")
    .from("rests").where('username',req.body.username)
    .then(restevents => {
      restevents.forEach(event => {
        if ((req.body.starttime >= event.starttime && req.body.starttime <= event.endtime)
        || (req.body.endtime <= event.endtime && req.body.endtime >= event.starttime)) {
          return res.status(400).json(`Unable to add the event.\nIt has time conflict with the Rest Time: ${event.name}`)
        }
      })
      db('rests')
      .returning('*')
      .insert(req.body)
      .then(event => res.status(200).json(`Succeed!\nYou have added ${event[0].name} successfully`))
      .catch(err => res.status(400).json('Unable to add the event.\nYou may have duplicate event name.'))
    });
  });
}

const deleteAllRestEvents = (db) => (req,res) => {
  db('rests').where('username',req.body.username)
  .del()
  .then(event => res.status(200).json(`Succeed!\nYou have deleted all of your Rest Time`))
  .catch(err => res.status(400).json('Failed\nYou already have no Rest Time'))
}

module.exports = {
	getRestEvents: getRestEvents,
	deleteRestEvents: deleteRestEvents,
	addRestEvents: addRestEvents,
	deleteAllRestEvents: deleteAllRestEvents
}