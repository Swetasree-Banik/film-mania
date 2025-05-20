const express = require('express');
const path = require('path');
const bodyParser= require('body-parser');

const db = require('./db')


const app = express();

app.use(bodyParser.urlencoded({extends:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'../frontend')));

app.get('/',(req, res) => {
    res.sendFile('/index.html'); 
});

app.get('/productions', (req, res) => { 
    const pcompanies = 'SELECT name FROM production ORDER BY name ASC;';
    db.query(pcompanies, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(result);
    });
});

app.get('/movies', (req, response)=>{
    const getMovies = 'SELECT title FROM movie ORDER BY title ASC';
    db.query(getMovies, [], (err, res)=>{
        if(err){
            return response.status(400).send('Error')
        }
        response.json(res)
    })
})

app.post('/insertMovie',(req,response)=>{
    const {mTitle, yof, length, genre, production, plot} = req.body;
    const productions = Array.isArray(production) ? production :[production] ;
    const genres = Array.isArray(genre) ? genre : [genre] ;
    console.log(mTitle, yof, length, genre, production, plot);

    db.beginTransaction((err)=>{
        if (err) throw err;
        const checkMovie = 'SELECT m_id FROM movie WHERE title = ? AND year_of_release = ?';
        db.query(checkMovie, [mTitle, yof], (er,res)=>{
            if(er){
                return db.rollback(()=>{
                    throw er;
                })
            }

            if(res.length > 0){
                return response.status(400).send('Movie already exist');
            }

            let newMovieID;
            const getLastID = 'SELECT m_id FROM movie ORDER BY m_id DESC LIMIT 1';
            db.query(getLastID, [], (er1,res1)=>{
                if(er1){
                    return db.rollback(()=>{
                        throw er1;
                    });
                }
                if(res1.length === 0){
                    newMovieID = 'm00001';
                }
                else{
                    console.log(res1[0].m_id);
                    let lastID = parseInt(res1[0].m_id.substring(1));
                    newMovieID = 'm'+padDigits(lastID+1, 5);
                }
                let genreList;
                // First, sort the genres array alphabetically
                const sortedGenres = genres.sort((a, b) => a.localeCompare(b));

                // Then, concatenate the sorted genres into a single string
                genreList = sortedGenres.join(',');

                console.log(genreList);

                const insetToMovie = 'INSERT INTO movie (m_id, title, year_of_release, length, genre) VALUES (?,?,?,?,?)';
                db.query(insetToMovie, [newMovieID, mTitle,yof, length, genreList], (er4, res4)=>{
                    if(er4){
                        return db.rollback(()=>{
                            throw er4;
                        });
                    }
                    let remLength = productions.length ;
                    for(i = 0 ; i < productions.length; i++){
                        console.log(productions[i].toLowerCase());
                        const getProdID = 'SELECT p_id FROM production WHERE name = ?';
                        db.query(getProdID, [productions[i]], (er5, res5)=>{
                            if(er5){
                                db.rollback(()=>{
                                    throw er5;
                                });
                            }
                            console.log(res5[0])
                            const insertToOwnedBy = 'INSERT INTO owned_by (p_id, m_id) VALUES (?, ?)';
                            db.query(insertToOwnedBy, [res5[0].p_id, newMovieID], (er6, res6)=>{
                                if(er6){
                                    return db.rollback(()=>{
                                        throw er6;
                                    });
                                }
                                remLength--;
                                console.log(remLength)
                                if(remLength === 0){
                                    db.commit((e)=>{
                                        if(e){
                                            return db.rollback(()=>{
                                                throw e;
                                            });
                                        }
                                        console.log('Success');
                                        response.redirect('/success.html');
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
});

app.post('/insertActor',(req, response)=>{
    const{ aName, dob, movie, role, quote} = req.body;
    const movies = Array.isArray(movie) ? movie : [movie];
    const quotes = Array.isArray(quote) ? quote :[quote];

    db.beginTransaction((error)=>{
        if(error)   throw error;
        const actorPresent = 'SELECT a_id FROM actor WHERE name = ? AND dob = ?'
        db.query(actorPresent, [aName, dob], (err, res)=>{
            if(err)
                return db.rollback(()=>{
                    throw err;
            });
            let newID;
            if(res.length == 0){
                const getLastID = 'SELECT a_id FROM actor ORDER BY a_id DESC LIMIT 1';
                db.query(getLastID, [], (err1,res1)=>{
                    if(err1){
                        return db.rollback(()=>{
                            throw err1;
                        })
                    }
                    
                    if(res1.length === 0)
                        newID = 'a00001';
                    else{
                        const lastID = parseInt(res1[0].a_id.substring(1));
                        newID = 'a'+padDigits(lastID+1,5) ;
                    }
                    const insertActor = 'INSERT INTO actor (a_id, name, dob) VALUES (?, ?, ?)';
                    db.query(insertActor, [newID, aName, dob], (err2, res2)=>{
                        if(err2)
                            return db.rollback(()=>{
                                throw err2;
                            });
                    });
                });
            }
            else{
                newID = res[0].a_id;
            }
            const roles = role.split('#');
            const quotes = quote.split('#');
            remLength = movies.length;
            for(let i = 0; i < movies.length; i++){
                const getMovieID = 'SELECT m_id FROM movie WHERE title = ?';
                db.query(getMovieID, [movies[i]], (err3, res3)=>{
                    if(err3)
                        return db.rollback(()=>{
                            throw err3
                        });
                    if(res3.length === 0)
                        return response.status(400).send('Movie Not Exist');
                    let rolesList
                    if(roles[i] == null){
                        rolesList = 'No Information Available'
                    }
                    else{
                        const rolesOfEach = roles[i].split('$');
                        for(let i = 0; i < rolesOfEach.length; i++){
                            if(i === 0)
                                rolesList = rolesOfEach[i]
                            else
                                rolesList = rolesList+','+rolesOfEach[i];
                        }
                    }
                    const alreadyExist = 'SELECT * from acted_on WHERE a_id = ? AND m_id = ?';
                    db.query(alreadyExist, [newID, res3[0].m_id], (err7, res7)=>{
                        if(err7)
                            return db.rollback(()=>{
                                throw err7;
                            })
                        if(res7.length > 0 ){
                            return response.status(400).send('This Entry Already Existed')
                        }
                        const insertActedOn = 'INSERT INTO acted_on (a_id, m_id, role) VALUES (?, ?, ?)';
                        db.query(insertActedOn, [newID, res3[0].m_id, rolesList], (err4, res4)=>{
                            if(err4)
                                return db.rollback(()=>{
                                    throw err4
                                });
                            if(quotes[i] == null){
                                remLength--
                                if(remLength === 0){
                                    db.commit((error)=>{
                                        if(error)
                                            return db.rollback(()=>{
                                                throw error;
                                            })
                                        console.log(success);
                                        response.redirect('/success.html');
                                    });
                                }
                            }
                            else{
                                const quotesOfEach = quotes[i].split('$');
                                let quoteList;
                                for(let i = 0; i < quotesOfEach.length; i++){
                                    if(i === 0)
                                        quoteList = quotesOfEach[i]
                                    else
                                        quoteList = quoteList+','+quotesOfEach[i];
                                }
                                const insertToquotes = 'INSERT INTO quote (a_id, m_id, quote) VALUE (?, ?, ?)';
                                db.query(insertToquotes, [newID, res3[0].m_id, quoteList], (err5, res5)=>{
                                    if(err5)
                                        return db.rollback(()=>{
                                            throw err5;
                                        })
                                    remLength--
                                    if(remLength === 0){
                                        db.commit((error)=>{
                                            if(error)
                                                return db.rollback(()=>{
                                                    throw error;
                                                })
                                            console.log('success');
                                            response.redirect('/success.html');
                                        });
                                    }
                                });
                            }
                        });    
                    });
                });
            }
        });
    });
});

app.post('/insertDirector',(req, response)=>{
    const {dName, dob, movie} = req.body;
    const movies = Array.isArray(movie) ? movie : [movie];
    db.beginTransaction((error)=>{
        if(error)
            throw error;
        const checkEntry = 'SELECT d_id FROM director WHERE name = ? AND dob = ?';
        db.query(checkEntry, [dName, dob], (err, res)=>{
            if(err)
                return db.rollback(()=>{
                    throw err;
                })
            let newID ;
            if(res.length == 0){
                const getLastID = 'SELECT d_id FROM director ORDER BY d_id DESC LIMIT 1';
                db.query(getLastID, [], (err1, res1)=>{
                    if(err1)
                        return db.rollback(()=>{
                            throw err1;
                    })
                    if(res1.length == 0)
                        newID = 'd00001';
                    else{
                        const lastID = parseInt(res1[0].d_id.substring(1));
                        newID = 'd'+padDigits(lastID+1, 5);
                    }
                    console.log(newID);
                    const insertDirector = 'INSERT INTO director (d_id, name, dob) VALUE (?, ?, ?)';
                    db.query(insertDirector, [newID, dName, dob], (err2, res2)=>{
                        if(err2)
                            return db.rollback(()=>{
                                throw err2;
                            }); 
                    });
                });
            }
            else{
                newID = res[0].d_id;
            }
            let remLength = movies.length;
            for(let i = 0; i < movies.length; i++){
                const getMovieID = 'SELECT m_id FROM movie WHERE title = ?';
                db.query(getMovieID, [movies[i]], (err3, res3)=>{
                    if(err3)
                        return db.rollback(()=>{
                            throw err3;
                        })
                    if(res3.length == 0)
                        return response.status(400).send('Movie Does Not Exist');
                    const relAlreadtExist = 'SELECT * FROM directed WHERE d_id = ? AND m_id = ?';
                    db.query(relAlreadtExist, [newID, res3[0].m_id], (err4, res4)=>{
                        if(res4.length > 0){
                            return response.status(400).send('Entry Already Exist');
                        }
                        else{
                            const insertRel = 'INSERT INTO directed (d_id, m_id) VALUE (?, ?)';
                            db.query(insertRel, [newID, res3[0].m_id], (err5, res5)=>{
                                if(err5)
                                    return db.rollback(()=>{
                                        throw err5;
                                    })
                                remLength--
                                if(remLength === 0){
                                    db.commit((error)=>{
                                        if(error)
                                            return db.rollback(()=>{
                                                throw error;
                                            })
                                        console.log('success');
                                        response.redirect('/success.html');
                                    });
                                }
                            })
                        }
                    })
                });
            }
        });     
    });
});

app.get('/getAllDetails',(req, response)=>{
    const {frange, lrange} = req.query;
    console.log(frange,lrange)
    const sortDetails = 'SELECT title, year_of_release, length, genre, director.name AS dName, production.name AS pName FROM movie ,production,owned_by,director,directed WHERE movie.m_id = owned_by.m_id AND production.p_id = owned_by.p_id AND director.d_id = directed.d_id AND movie.m_id = directed.m_id AND year_of_release BETWEEN ? AND ? ORDER BY year_of_release ASC, SUBSTRING_INDEX(genre, ?, 1) ASC;';
    db.query(sortDetails, [frange, lrange, ','], (err, res)=>{
        if(err)
            return response.status(400).send('Connection Problem');
        return response.json(res);
    })
});

app.get('/getDetails',(req,response)=>{
    const{productionCompany} = req.query;
    console.log(productionCompany)
    const getDetails = 'SELECT title, year_of_release AS yof, director.name AS dName, genre, production.name AS pName, length FROM movie, production, owned_by, director, directed WHERE movie.m_id = owned_by.m_id AND production.p_id = owned_by.p_id AND director.d_id = directed.d_id AND movie.m_id = directed.m_id AND production.name = ? ORDER BY SUBSTRING_INDEX(genre, ?, 1) ASC, director.name ASC';
    db.query(getDetails,[productionCompany,','],(err,res)=>{
        if(err)
            return response.status(400).send('Error');
        return response.json(res);
    })
})

app.get('/home',(req,res)=>{
    res.redirect('/index.html');
});

function padDigits(number, digits) {
    return String(number).padStart(digits, '0');
}

app.listen(5000, () => {
    console.log('Server started on http://localhost:5000');
});