import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import {
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    setDoc
} from "firebase/firestore"
import { notesCollection, db } from "./firebase"

export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const [loading, setLoading] = React.useState(true)
    const [tempNoteText, settempNoteText] = React.useState("")


    // 以「衍生值（derived value）」處理currentNote：比將之設計為獨立的 state 要好，因為需要額外的 useEffect 來處理同步問題，而且可能會出現數據不一致
    //   1. 自動同步
    //   2. 單一數據源
    const currentNote =   //確定 currentNote
        notes.find(note => note.id === currentNoteId)
        || notes[0]

    const sortedNotes = notes.slice().sort((a, b) => {
        return b.updatedAt - a.updatedAt
    })

    // connecting firebase
    //這樣就確保了 currentNote 始終反映 Firebase 數據庫中的內容。當數據庫內容更新時，onSnapshot 會自動觸發，更新本地的 notes state，進而更新 currentNote。
    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
            // Sync up our local notes array with the snapshot data
            const notesArr = snapshot.docs.map(doc => ({    // 以onSnapshot 監聽 Firebase 數據
                ...doc.data(),
                id: doc.id
            }))

            console.log(notesArr)
            setNotes(notesArr) // 這裡把 Firebase 數據存入 notes state
            setLoading(false); // 数据加载完成
        })
        return unsubscribe
    }, [])



    // 狀態依賴(仰賴notes的最新值)
    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])



    // 改變tempNoteText based on every stroke in <Editor />
    React.useEffect(() => {
        if (currentNote) settempNoteText(currentNote.body)
    }, [currentNote])


    //Debouncing: delay the execution of sending notes to database by 500ms
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            // tempNoteText : 表示目前文字編輯器中的暫存內容，會即時更新，隨著用戶每次輸入而改變
            // currentNote.body : 表示目前筆記在資料庫中的內容，是最新保存到 Firebase 資料庫中的狀態
            // 不同時，代表用戶真的修改了內容，需要將改動保存到資料庫。
            // 相同時，不執行 updateNote，避免不必要的請求。
            if (tempNoteText !== currentNote.body) updateNote(tempNoteText)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [tempNoteText])



    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }



    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId)
        await setDoc(docRef, { body: text, updatedAt: Date.now(), }, { merge: true })
    }




    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }



    // 未拿到數據的畫面渲染
    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading...</h1>
            </main>
        );
    }

    // 拿到數據的畫面渲染
    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {/* currentNoteId &&
                            notes.length > 0 && */}
                        <Editor
                            currentNote={currentNote}
                            updateNote={updateNote}
                            tempNoteText={tempNoteText}
                            settempNoteText={settempNoteText}
                        />
                        {/* } */}
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                        </button>
                    </div>

            }
        </main>
    )
}
