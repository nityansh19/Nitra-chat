from pathlib import Path

connections = Path("src/app/connections/page.tsx")
text = connections.read_text()
old = '''  async function messageFriend(person: UserProfile) {
    if (!currentUser?.uid) return;
    setActionId(person.uid);
    try {
      await findOrCreateDirectConversation(currentUser.uid, person.uid);
      window.location.href = "/";
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setActionId(""); }
  }'''
new = '''  async function messageFriend(person: UserProfile) {
    if (!currentUser?.uid) return setError("Sign in again before starting a conversation.");
    setActionId(person.uid); setError("");
    try {
      await findOrCreateDirectConversation(currentUser.uid, person.uid);
      localStorage.setItem("nitra-open-chat", JSON.stringify({ id: person.uid, name: person.name, initials: person.initials, email: person.email, nitraId: person.nitraId, bio: person.bio || "", status: person.status || "Available", online: true }));
      window.location.href = "/";
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setActionId(""); }
  }'''
if old not in text:
    raise SystemExit("friend message handler not found")
connections.write_text(text.replace(old, new, 1))

page = Path("src/app/page.tsx")
text = page.read_text()
anchor = '  useEffect(() => { if (ready) localStorage.setItem("nitra-ui-saved-v4", JSON.stringify(saved)); }, [saved, ready]);'
insertion = '''  useEffect(() => {
    if (!ready) return;
    const raw = localStorage.getItem("nitra-open-chat");
    if (!raw) return;
    try {
      const contact = JSON.parse(raw) as Contact;
      const id = `chat-${contact.id}`;
      setChats((prev) => prev.some((chat) => chat.id === id) ? prev : [...prev, { id, contact, messages: [], unread: 0, lastTime: "New" }]);
      setActiveId(id);
      setTab("inbox");
    } catch {
      // Ignore malformed navigation state.
    } finally {
      localStorage.removeItem("nitra-open-chat");
    }
  }, [ready]);
'''
if anchor not in text:
    raise SystemExit("home navigation anchor not found")
if 'nitra-open-chat' not in text:
    page.write_text(text.replace(anchor, insertion + anchor, 1))
