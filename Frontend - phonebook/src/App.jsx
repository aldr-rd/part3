import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import personsService from './services/persons'
import './index.css'
import Notification from './components/Notification'


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [infoMessage, setInfoMessage] = useState(null)

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event => {
    event.preventDefault()

    const nameToCheck = newName.toLowerCase()
    const existsPerson = persons.find(person => person.name.toLowerCase() === nameToCheck)

    if (existsPerson) {
      const actualizar = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)

      if (!actualizar) return

      const updatedPerson = { ...existsPerson, number: newNumber }
      personsService
        .update(existsPerson.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))
          setNewName('')
          setNewNumber('')
          setInfoMessage({
            message: `Updated ${newName}'s number`,
            type: 'success'
          })
          setTimeout(() => {
            setInfoMessage(null)
          }, 5000)
        })
        .catch(error => {
          setInfoMessage({
            message: error.response.data.error,
            type: 'error'
          })
          setTimeout(() => {
            setInfoMessage(null)
          }, 5000)
        })
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    personsService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setInfoMessage({
          message: `Added ${newName}`,
          type: 'success'
        })
        setTimeout(() => {
          setInfoMessage(null)
        }, 5000)
      })
      .catch(error => {
        setInfoMessage({
          message: error.response.data.error,
          type: 'error'
        })
        setTimeout(() => setInfoMessage(null), 5000)
      })
  })

  const removePerson = (id, name) => {
    const ok = window.confirm(`Delete ${name} ?`)
    if (!ok) return
    personsService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
        setInfoMessage({
          message: `Deleted ${name}`,
          type: 'error'
        })
        setTimeout(() => {
          setInfoMessage(null)
        }, 5000)
      })
  }

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={infoMessage?.message} type={infoMessage?.type} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h2>add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>
      <Persons
        personsToShow={personsToShow}
        removePerson={removePerson}
      />
    </div>
  )
}

export default App
