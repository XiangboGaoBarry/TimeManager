const getNormalEvents = (db) => (req,res) => {
	db.select('timespan','urgencylevel','deadline','name')
  .from('events')
  .where('username',req.body.username)
  .then(events => {
    res.send(events);
  });
}

const deleteNormalEvents = (db) => (req,res) => {
  db('events')
    .returning("*")
    .where({
      'name':req.body.DeleteEvent,
      'username':req.body.username
    })
    .del()
    .then(event => res.status(200).json(`Succeed!\nYou have deleted ${event[0].name} successfully`))
    .catch(err => res.status(400).json('Faided to delete the event.\nThis event may not be existed'))
}

const addNormalEvents = (db) => (req,res) => {
  db('events').returning("*").insert(req.body)
  .then(event => res.status(200).json(`Succeed!\nYou have added ${event[0].name} successfully`))
  .catch(err => res.status(400).json('Unable to add the event.\nYou may have duplicate event name.'))
}

const deleteAllNormalEvents = (db) => (req,res) => {
  db('events').where('username',req.body.username)
    .del()
    .then(event => res.status(200).json(`Succeed!\nYou have deleted all of your Rest Time`))
    .catch(err => res.status(400).json('Failed\nYou already have no Rest Time'))
}

module.exports = {
	getNormalEvents: getNormalEvents,
	deleteNormalEvents: deleteNormalEvents,
	addNormalEvents: addNormalEvents,
	deleteAllNormalEvents: deleteAllNormalEvents
}