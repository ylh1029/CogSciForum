import express from "express"
import db from "./db.js";
import cors from "cors"
import session from "express-session"
import bcryptjs from "bcryptjs"
import connectPgSimple from "connect-pg-simple"

const PgSession = connectPgSimple(session);

const app = express()
const port = process.env.PORT || 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://cogsci-forum-react-frontend.onrender.com",
]

const corsOptions = {
    origin: (origin, cb) => {
        if(!origin) return cb(null, true);
        if(allowedOrigins.includes(origin))return cb(null, true);
        return cb(new Error(`CORS blocked: ${origin}`)); 
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.set("trust proxy", 1);

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none": "lax",
    }
}));

function requireAuth(req, res, next){
    if (req.method === "OPTIONS") return next();
    if (!req.session?.userId) return res.status(401).json({ ok: false, user: null });
    next();
}

// async function requireAdmin(req, res, next) {
//   const result = await db.query(
//     "SELECT role FROM users WHERE user_id = $1",
//     [req.session.userId]
//   );

//   if (result.rowCount === 0) return res.status(401).json({ ok: false });
//   if (result.rows[0].role !== "admin") return res.status(403).json({ ok: false, error: "Forbidden" });

//   next();
// }

app.get('/', (req, res) => {
    res.json({
        message: "clear"
    })
})

app.get('/discussions', async(req, res) => {
    try{
        const sql = `
            SELECT discussion_id, title, date_published, body, paper_id, username, pfp
            FROM cogsci_forum_db.discussions
            LEFT JOIN cogsci_forum_db.users
                ON discussions.user_id = users.user_id
            WHERE users.user_id IS DISTINCT FROM $1
            ORDER BY discussion_id ASC;
        `
        const values = [D]
        const results = await db.query(sql, values);

        res.json({
            discussions: results.rows
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send("Server Error")
    }
})

app.get('/discussions/:id', async(req, res) => {
    try{
        // console.log("INVOKED")
        const sql = `
            SELECT title, users.first_name, users.last_name, body, paper_url, aim, procedure, participants, results, conclusion
            FROM discussions 
            LEFT JOIN users
            ON discussions.user_id = users.user_id
            WHERE discussion_id = $1
        `

        const values = [req.params.id]
        const results = await db.query(sql, values);
        console.log(results.rows[0])

        res.json({
            discussion: results.rows[0]
        })
    }
    catch(err){
        console.log(err)
        res.status(500).send("Server Error")
    }
})

app.post('/discussions', requireAuth, async(req, res) => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(400).json({ok: false}).json({ok: false, error: "You need to be logged in to make a discussion post"})
        }

        const {title, description, topic, url, aim, participants, procedure, results, conclusion} = req.body

        if(!title || !description){
            return
        }

        const sql = `
            INSERT INTO discussions
                (title, user_id, body, paper_url, aim, procedure, participants, results, conclusion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING discussion_id
        `
        
        const values = [title, userId, description];

        if(url){
            values.push(url)
        }
        else{
            values.push(null)
        }
        
        if(aim){
            values.push(aim)
        }
        else{
            values.push(null)
        }

        if(procedure){
            values.push(procedure)
        }
        else{
            values.push(null)
        }

        if(participants){
            values.push(participants)
        }
        else{
            values.push(null)
        }

        if(results){
            values.push(results)
        }
        else{
            values.push(null)
        }

        if(conclusion){
            values.push(conclusion)
        }
        else{
            values.push(null)
        }

        const result = await db.query(sql, values)
        
        const discussion_id = result.rows[0].discussion_id

        const topicSql = `
            SELECT tag_id 
            FROM tags
            WHERE category = $1
        `

        const topicValue = [topic]

        const topic_result = await db.query(topicSql, topicValue)

        if(topic_result.rows.length === 0){
            return res.status(400).json({ok: false, error: "Invelid topic (no matching tag found)"});
        }

        const tag_id = topic_result.rows[0].tag_id

        const insertSql = `
            INSERT INTO discussion_tags(discussion_id, tag_id)
            VALUES ($1, $2)
        `

        const insertValue = [discussion_id, tag_id]
        
        await db.query(insertSql, insertValue)

        res.json({
            ok: true,
            discussion_id
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send("Server Error")
    }
})

app.delete('/discussions', async(req, res) => {
    const values = [req.query.id]
    const sql = `
        DELETE FROM discussions
        WHERE discussion_id = $1
        RETURNING *;
    `
    const result = await db.query(sql,values);

    res.json({
        ok: true,
        deletedDiscussion: result.rows[0]
    });
})

app.get('/searchResults', async(req, res) => {
    const keyword = req.query.keyword;
    const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${keyword}&limit=20`,
    {
        headers: {
        "x-api-key": process.env.API_KEY
        },
    }
    );

    const data = await response.json();
    let ids = [];

    data.data.forEach(paper => {
        ids.push(paper.paperId)
    });

    const response_id = await fetch(
    "https://api.semanticscholar.org/graph/v1/paper/batch?fields=referenceCount,citationCount,title,url,isOpenAccess,openAccessPdf,authors",
    {
        method: "POST",
        headers: {
        "x-api-key": process.env.API_KEY,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ids})
    }
    );
    const data_papers = await response_id.json();

    const cleaned = data_papers.map(paper => ({
        referenceCount: paper.referenceCount,
        citationCount: paper.citationCount,
        title: paper.title,
        url: paper.url,
        pdf: paper.isOpenAccess,
        pdfUrl: paper.openAccessPdf,
        authors: paper.authors.map(a => a.name),
    }));

    res.json(cleaned);
}) 

app.get('/getTags', async(req, res) => {
    try{
        const sql = `
            SELECT *
            FROM tags;
        `

        const results = await db.query(sql);

        res.json({
            tags: results.rows
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send("Server Error")
    }
})

app.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body

        if(!username || !password){
            res.status(400).send("Make sure you fill in all the fields")
        }

        const sql = `
            SELECT *
            FROM users
            WHERE username = $1
        `

        const input = [username]
        const results = await db.query(sql, input)

        if(results.rows.length == 0){
            res.status(401).json({message: "Invalid username"})
        }

        const isPassCorrect = await bcryptjs.compare(password, results.rows[0].password)

        if(!isPassCorrect){
            res.status(400).send("Invalid password")
        }

        req.session.variableName = "variableValue"
        req.session.userId = results.rows[0].user_id

        res.json({
            ok: true,
        });
    }

    catch(error){
        console.log(error);
        res.send("Server Error")
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(500).json({ok: false});
        res.clearCookie("connect.sid");
        res.json({ok:true});
    })
})

app.post('/signup', async(req, res) => {
    try{
        const {username, email, password, first_name, last_name} = req.body

        if(!username || !email || !password || !first_name){
            res.json({message: "One or more required fields are missing."})
            return;
        }
        const sqlRegistered = `
            SELECT *
            FROM users
            WHERE username = $1 OR email = $2;
        `

        const valueRegistered = [username, email]
        const registeredResult = await db.query(sqlRegistered, valueRegistered);

        if(registeredResult.rows.length > 0){
            res.json({message: "Username or email already registered"})
            return;
        }

        const sql = `
            INSERT INTO users (username, email, password, first_name, last_name)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `

        const hashedPassword = await bcryptjs.hash(password, 10)
        const values = [username, email, hashedPassword, first_name];

        if(!last_name){
            values.push("");
        }
        else{
            values.push(last_name);
        }

        const results = await db.query(sql, values);

        req.session.variableName = "variableValue"
        req.session.userId = results.rows[0].user_id;

        res.json({
            message: "success!!",
            user: results.rows[0]
        })
    }
    catch(error){
        console.log(error);
        res.send("Server Error");
    }
})

app.get("/me", requireAuth, async(req, res) => {
    try{
        const sql = `
            SELECT user_id, username, email, first_name, last_name, biography
            FROM users
            WHERE user_id = $1
        `
        const value = [req.session.userId]
        const result = await db.query(sql, value);

        if(result.rowCount === 0){
            return res.status(404).json({users:null})
        }

        res.json({
            ok: true,
            users: result.rows[0]});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ok: false, users: null, error: "Server Error"});
    }
})

app.get("/userInterests", requireAuth, async(req, res) => {
    try{
        const sql = `
            SELECT *
            FROM user_favourite_tags
            LEFT JOIN tags
                ON user_favourite_tags.tag_id = tags.tag_id
            WHERE user_id = $1;
        `
        const value = [req.session.userId]
        const result = await db.query(sql, value);

        if(result.rowCount === 0){
            return res.json({ok: true, list: []})
        }

        res.json({
            ok: true,
            list: result.rows,
            count: result.rowCount});
    }
    catch(error){
        console.log(error);
        res.send("Server Error")
    }
})

app.put("/userProfile", requireAuth, async(req, res) => {
    try{
        const {username, userBody} = req.body    

        if(!username){
            res.status(400).json({
                message: "Error: Username is missing."
            })
            return
        }

        const fullName = username.split(" ");

        const sql = `
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                biography = $3
            WHERE user_id = $4
            RETURNING *
        `

        const values = [fullName[0], fullName[1]]
        if(userBody){
            values.push(userBody)
        }
        else{
            values.push("")
        }
        values.push(req.session.userId)

        const results = await db.query(sql, values)

        res.json(results.rows[0])
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        })
    }
})

app.get("/interestTags", async(req, res) => {
    try{
        const sql = `
            SELECT * 
            FROM tags
        `

        const result = await db.query(sql)

        res.json({
            ok: true,
            tags: result.rows
        })
    }
    catch(error){
        console.log(error);
        res.send("Server Error")
    }
})

app.get("/interestTags/tag_id", async(req, res) => {
    try{
        const sql = `
            SELECT *
            FROM tags
            WHERE category = $1;
        `
        const values = [req.query.category]
        const result = await db.query(sql, values)

        res.json({
            ok: true,
            tag: result.rows[0]
        })
    }
    catch(error){
        console.log(error);
        res.send("Server Error")
    }
})

app.put("/interestTags", requireAuth, async(req, res) => {
    try{
        const user_id = req.session.userId;
        const {tags} = req.body;

        if(!Array.isArray(tags)){
            return res.status(400).json({ok: false, error: "tagus must be an array"})
        }

        const tagIds = [...new Set(
            tags.map(t => Number(t.tag_id)).filter(Number.isInteger)
        )];

        const sql = `
            INSERT INTO user_favourite_tags(user_id, tag_id)
            SELECT $1, x.tag_id
            FROM unnest($2::int[]) AS x(tag_id)
            ON CONFLICT (user_id, tag_id) DO NOTHING
            RETURNING tag_id;
        `

        const result = await db.query(sql, [user_id, tagIds]);
        res.json({ok: true, added: result.rowCount, tagIdsAdded: result.rows.map(r=>r.tag_id)});
    }
    catch(error){
        console.log(error)
        res.send("Server Error")
    }
})

app.delete("/interestTags", requireAuth, async(req, res) => {
    try{
        const userId = req.session.userId;
        const {tags} = req.body;

        if(!Array.isArray(tags) || tags.length === 0){
            return res.status(400).json({
                ok: false,
                error: "tags array required",
            })
        }

        const tagIds = [...new Set(
            tags.map(t=>Number(t.tag_id)).filter(Number.isInteger)
        )];

        if(tagIds.length === 0){
            return res.status(400).json({
                ok: false,
                error: "No valid tag_ids provided",
            })
        }

        const sql = `
            DELETE FROM user_favourite_tags
            WHERE user_id = $1
                AND tag_id NOT IN (
                SELECT unnest($2::int[])
                )
            RETURNING tag_id;
        `

        const result = await db.query(sql, [userId, tagIds])

        res.json({
            ok: true,
            deleted: result.rowCount,
            deletedTagIds: result.rows.map(r=>r.tag_id),
        });
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok: false, error: "Server error"});
    }
})

app.get('/user/saved', requireAuth, async(req, res) => {
    try{
        const sql = `
            SELECT discussion_id
            FROM user_saved_discussions
            WHERE user_id = $1
        `

        const values = [req.session.userId]
        const result = await db.query(sql, values)
        const discussionIds = result.rows.map(r=>r.discussion_id)

        if(discussionIds.length === 0){
            return res.json({ok: true, discussions: []});
        }

        const discussionsSql = `
            SELECT title, body, discussions.user_id, first_name, last_name, username, discussion_id
            FROM discussions
            LEFT JOIN users
            ON discussions.user_id = users.user_id
            WHERE discussion_id = ANY($1::int[])
            ORDER BY discussion_id DESC
        `
        console.log("Discussion id: ", discussionIds);

        const discussionsResult = await db.query(discussionsSql, [discussionIds]);

        return res.json({
            ok: true,
            discussions: discussionsResult.rows,
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok:false, error: "Server error"});
    }
})

app.delete("/user/saved", requireAuth, async(req, res) => {
    try{
        const sql = `
            DELETE FROM user_saved_discussions
            WHERE user_id = $1 AND discussion_id = $2
            RETURNING *;
        `
        const values = [req.session.userId, req.query.id]
        const result = await db.query(sql, values);

        return res.json({
            ok: true,
            deleted: result.rows[0],
        })

    }
    catch(error){
        console.error(error)
        res.status(500).json({ok: false, error: "Server error"});
    }
})

app.post("/user/saved", requireAuth, async(req, res) => {
    try{
        const sql = `
            INSERT INTO user_saved_discussions(user_id, discussion_id)
            VALUES($1, $2)
            RETURNING *
        `
        const value = [req.session.userId, req.body.id]
        const result = await db.query(sql, value)

        return res.json({
            ok: true,
            inserted: result.rows[0]
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok: false, error: "Server error"});
    }
})

app.get('/discussion/save/match', requireAuth, async(req, res) => {
    try{
        const sql = `
            SELECT *
            FROM user_saved_discussions
            WHERE user_id = $1 AND discussion_id = $2;
        `

        const values = [req.session.userId, req.query.id]

        const result = await db.query(sql, values)

        return res.json({
            ok: true,
            saved: result.rows.length > 0
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok:false, error: "Server error"})
    }
})

app.get('/user/posted', requireAuth, async(req, res) => {
    try{
        const sql = `
            SELECT discussion_id
            FROM discussions
            WHERE user_id = $1
        `

        const values = [req.session.userId]
        const result = await db.query(sql, values)
        const discussionIds = result.rows.map(r=>r.discussion_id)

        if(discussionIds.length === 0){
            return res.json({ok: true, discussions: []});
        }

        const discussionsSql = `
            SELECT title, body, discussions.user_id, first_name, last_name, username, discussion_id
            FROM discussions
            LEFT JOIN users
            ON discussions.user_id = users.user_id
            WHERE discussion_id = ANY($1::int[])
            ORDER BY discussion_id DESC
        `

        const discussionsResult = await db.query(discussionsSql, [discussionIds]);

        return res.json({
            ok: true,
            discussions: discussionsResult.rows,
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok:false, error: "Server error"});
    }
})

app.get("/featuredDiscussions", async(req, res)=>{
    try{
        const sql = `
            SELECT *
            FROM discussions
            WHERE user_id = $1
        `
        const value = [15]
        const result = await db.query(sql, value)
        console.log("featured: ", result.rows)

        return res.json({
            ok: true,
            discussions: result.rows
        })
    }
    catch(error){
        console.error(error)
        res.status(500).json({ok:false, error: "Server error"});
    }
    
})

app.get("/discussion/tag", async(req, res) => {
    try{
        const sql = `
            SELECT tags.category
            FROM discussion_tags
            LEFT JOIN tags
            ON tags.tag_id = discussion_tags.tag_id
            WHERE discussion_id = $1
        `
        const values = [req.query.discussion_id]

        const result = await db.query(sql, values)
        console.log("Result rows[0]:", result.rows[0])
        return res.json({
                ok: true,
                tag: result.rows[0]
            })
        }
    catch(error){
        console.error(error)
        res.status(500).json({ok:false, error: "Server error"});
    }
    
})

app.get("/health", (req, res) => res.status(200).send("ok"));


app.listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port}`)});
