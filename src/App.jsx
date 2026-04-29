import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router'

function HomePage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          setIsAuthenticated(false)
          setUsername('')
          setLoading(false)
          return
        }

        const data = await response.json()
        setIsAuthenticated(true)
        setUsername(data.username)
        setLoading(false)
      } catch (error) {
        console.error('request error:', error)
        setIsAuthenticated(false)
        setUsername('')
        setLoading(false)
      }
    }

    loadMe()
  }, [])

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось выйти')
        return
      }

      setErrorMessage('')
      setIsAuthenticated(false)
      setUsername('')
      setShowDeleteForm(false)
      setDeletePassword('')
      setDeleteErrorMessage('')
      navigate('/login')
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault()
    setDeleteErrorMessage('')

    try {
      const response = await fetch('/api/users/me/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: deletePassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setDeleteErrorMessage(errorData?.message || 'Не удалось удалить аккаунт')
        return
      }

      localStorage.removeItem(`savedCategoryNames_${username}`)

      setIsAuthenticated(false)
      setUsername('')
      setShowDeleteForm(false)
      setDeletePassword('')
      setDeleteErrorMessage('')
      setErrorMessage('')
      navigate('/')
    } catch (error) {
      console.error('request error:', error)
      setDeleteErrorMessage('Не удалось отправить запрос')
    }
  }

  return (
    <div className="container">
      <h1>Finance Tracker</h1>

      {loading && <p>Загрузка...</p>}

      {!loading && !isAuthenticated && (
        <>


          <div className="menu">
            <Link className="nav-button" to="/register">Регистрация</Link>
            <Link className="nav-button" to="/login">Логин</Link>
          </div>
        </>
      )}

      {!loading && isAuthenticated && (
        <>
          <p>Текущий пользователь: {username}</p>

          <div className="menu">
            <Link className="nav-button" to="/transactions">Транзакции</Link>
            <Link className="nav-button" to="/balance">Баланс</Link>
            <button type="button" onClick={handleLogout}>Выйти</button>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                setShowDeleteForm(!showDeleteForm)
                setDeleteErrorMessage('')
                setDeletePassword('')
              }}
            >
              Удалить аккаунт
            </button>

            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </div>

          {showDeleteForm && (
            <form className="menu" onSubmit={handleDeleteAccount}>
              <input
                type="password"
                placeholder="Введите текущий пароль"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
              />

              <button type="submit" className="danger-button">
                Подтвердить удаление
              </button>

              {deleteErrorMessage && (
                <p className="error-text">{deleteErrorMessage}</p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  )
}

function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const registerResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Ошибка регистрации')
        return
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Регистрация прошла, но логин не выполнен')
        return
      }

      navigate('/')
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
    }
  }

  return (
    <div className="container">
      <h1>Регистрация</h1>

      <form className="menu" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Зарегистрироваться</button>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </form>

      <div className="menu">
        <Link className="nav-button" to="/">Назад</Link>
      </div>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Ошибка логина')
        return
      }

      setErrorMessage('')
      navigate('/')
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
    }
  }

  return (
    <div className="container">
      <h1>Логин</h1>

      <form className="menu" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Войти</button>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </form>

      <div className="menu">
        <Link className="nav-button" to="/">Назад</Link>
      </div>
    </div>
  )
}

function CategoriesPage() {
  const [username, setUsername] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [name, setName] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [createErrorMessage, setCreateErrorMessage] = useState('')

  async function loadData() {
    try {
      const meResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (!meResponse.ok) {
        const errorData = await meResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось получить пользователя')
        setLoading(false)
        return
      }

      const meData = await meResponse.json()
      setUsername(meData.username)

      const categoriesResponse = await fetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
      })

      if (!categoriesResponse.ok) {
        const errorData = await categoriesResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось получить категории')
        setLoading(false)
        return
      }

      const categoriesData = await categoriesResponse.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setErrorMessage('')
      setLoading(false)
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('savedCategoryNames')
    if (stored) {
      setSavedCategoryNames(JSON.parse(stored))
    }
  }, [])

  async function handleCreateCategory(event) {
    event.preventDefault()
    setCreateErrorMessage('')

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setCreateErrorMessage(errorData?.message || 'Не удалось создать категорию')
        return
      }

      setName('')
      setType('EXPENSE')
      await loadData()
    } catch (error) {
      console.error('request error:', error)
      setCreateErrorMessage('Не удалось отправить запрос')
    }
  }

  return (
    <div className="container">
      <h1>Категории</h1>

      {loading && <p>Загрузка...</p>}

      {!loading && errorMessage && (
        <p className="error-text">{errorMessage}</p>
      )}

      {!loading && !errorMessage && (
        <>
          <p>Текущий пользователь: {username}</p>

          <form className="menu" onSubmit={handleCreateCategory}>
            <input
              type="text"
              placeholder="Название категории"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="EXPENSE">Расход</option>
              <option value="INCOME">Доход</option>
            </select>

            <button type="submit">Создать категорию</button>

            {createErrorMessage && (
              <p className="error-text">{createErrorMessage}</p>
            )}
          </form>

          {categories.length === 0 ? (
            <p>Категорий пока нет</p>
          ) : (
            <div className="menu">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <strong>{category.name}</strong>
                  <p>{category.type === 'EXPENSE' ? 'Расход' : 'Доход'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="menu">
        <Link className="nav-button" to="/">Назад</Link>
      </div>
    </div>
  )
}

function TransactionsPage() {
  const [type, setType] = useState('EXPENSE')
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [savedCategoryOptions, setSavedCategoryOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

  const [categoryId, setCategoryId] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [amountCents, setAmountCents] = useState('')
  const [currency, setCurrency] = useState('BYN')
  const [note, setNote] = useState('')

  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const storageKey = 'savedCategoryOptions'

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  function normalizeCategoryName(value) {
    const trimmed = value.trim()

    if (!trimmed) {
      return ''
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }

  function saveCategoryOption(name, categoryType) {
    const normalized = normalizeCategoryName(name)

    if (!normalized) {
      return
    }

    setSavedCategoryOptions((prev) => {
      const updated = [
        { name: normalized, type: categoryType },
        ...prev.filter(
          (item) =>
            !(item.name.toLowerCase() === normalized.toLowerCase() && item.type === categoryType)
        ),
      ]

      sessionStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  function getCategoryName(id) {
    const category = categories.find((item) => item.id === id)
    return category ? category.name : `ID ${id}`
  }

  function getTransactionType(transaction) {
    const category = categories.find((item) => item.id === transaction.categoryId)
    return category ? category.type : ''
  }

  function openDeleteModal(transaction) {
    setSelectedTransaction(transaction)
    setDeleteErrorMessage('')
    setShowDeleteModal(true)
  }

  function closeDeleteModal() {
    setSelectedTransaction(null)
    setDeleteErrorMessage('')
    setShowDeleteModal(false)
  }

  async function handleDeleteTransaction() {
    if (!selectedTransaction) {
      return
    }

    try {
      const response = await fetch(
        `/api/transactions/${selectedTransaction.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setDeleteErrorMessage(errorData?.message || 'Не удалось удалить транзакцию')
        return
      }

      closeDeleteModal()
      await loadData()
    } catch (error) {
      console.error('request error:', error)
      setDeleteErrorMessage('Не удалось отправить запрос')
    }
  }

  const filteredCategories = categories.filter((category) => category.type === type)

  const savedNamesForCurrentType = savedCategoryOptions
    .filter((item) => item.type === type)
    .map((item) => item.name)

  const categoryOptions = [
    ...new Set([
      ...savedNamesForCurrentType,
      ...filteredCategories.map((category) => category.name),
    ]),
  ]

  const visibleCategories = categoryOptions.filter((name) =>
    name.toLowerCase().includes(categoryName.trim().toLowerCase())
  )

  async function loadData() {
    try {
      const categoriesResponse = await fetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
      })

      if (!categoriesResponse.ok) {
        const errorData = await categoriesResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось получить категории')
        setLoading(false)
        return
      }

      const categoriesData = await categoriesResponse.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])

      const transactionsResponse = await fetch('/api/transactions', {
        method: 'GET',
        credentials: 'include',
      })

      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось получить транзакции')
        setLoading(false)
        return
      }

      const transactionsData = await transactionsResponse.json()
      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
      setErrorMessage('')
      setLoading(false)
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey)

    if (!stored) {
      setSavedCategoryOptions([])
      return
    }

    try {
      const parsed = JSON.parse(stored)
      setSavedCategoryOptions(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSavedCategoryOptions([])
    }
  }, [])

  useEffect(() => {
    if (!categoryName.trim()) {
      setCategoryId('')
      return
    }

    const matchedCategory = filteredCategories.find(
      (category) =>
        category.name.toLowerCase() === normalizeCategoryName(categoryName).toLowerCase()
    )

    if (matchedCategory) {
      setCategoryId(String(matchedCategory.id))
    } else {
      setCategoryId('')
    }
  }, [type, categories, categoryName])

  async function handleCreateTransaction(event) {
    event.preventDefault()
    setCreateErrorMessage('')

    if (!categoryName.trim()) {
      setCreateErrorMessage('Введи категорию')
      return
    }

    if (!amountCents.trim()) {
      setCreateErrorMessage('Введи сумму')
      return
    }

    try {
      let actualCategoryId = categoryId
      const normalizedCategoryName = normalizeCategoryName(categoryName)

      if (!actualCategoryId) {
        const createCategoryResponse = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: normalizedCategoryName,
            type,
          }),
        })

        if (!createCategoryResponse.ok) {
          const errorData = await createCategoryResponse.json().catch(() => null)
          setCreateErrorMessage(errorData?.message || 'Не удалось создать категорию')
          return
        }

        const createdCategory = await createCategoryResponse.json().catch(() => null)
        actualCategoryId = String(createdCategory.id)
        setCategoryId(actualCategoryId)
        setCategoryName(createdCategory.name)
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          categoryId: Number(actualCategoryId),
          amountCents: Math.round(Number(amountCents.replace(',', '.')) * 100),
          currency,
          occurredAt: new Date().toISOString(),
          note,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setCreateErrorMessage(errorData?.message || 'Не удалось создать транзакцию')
        return
      }

      saveCategoryOption(normalizedCategoryName, type)
      setAmountCents('')
      setCurrency('BYN')
      setNote('')
      setShowCategoryDropdown(false)
      await loadData()
    } catch (error) {
      console.error('request error:', error)
      setCreateErrorMessage('Не удалось отправить запрос')
    }
  }

  return (
    <div className="container">
      <h1>Транзакции</h1>

      {loading && <p>Загрузка...</p>}

      {!loading && errorMessage && (
        <p className="error-text">{errorMessage}</p>
      )}

      {!loading && !errorMessage && (
        <>
          <form className="menu" onSubmit={handleCreateTransaction}>
            <div className="custom-select">
              <input
                type="text"
                placeholder="Категория"
                value={categoryName}
                onFocus={() => setShowCategoryDropdown(true)}
                onChange={(event) => {
                  setCategoryName(normalizeCategoryName(event.target.value))
                  setShowCategoryDropdown(true)
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowCategoryDropdown(false)
                  }, 150)
                }}
                className="custom-select-input"
              />

              <button
                type="button"
                className="custom-select-arrow"
                onMouseDown={(event) => {
                  event.preventDefault()
                  setShowCategoryDropdown((prev) => !prev)
                }}
              >
                ▼
              </button>

              {showCategoryDropdown && visibleCategories.length > 0 && (
                <div className="custom-select-dropdown">
                  {visibleCategories.map((name) => (
                    <div
                      key={name}
                      className="custom-select-option"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        setCategoryName(name)

                        const matchedCategory = filteredCategories.find(
                          (category) => category.name.toLowerCase() === name.toLowerCase()
                        )

                        if (matchedCategory) {
                          setCategoryId(String(matchedCategory.id))
                        } else {
                          setCategoryId('')
                        }

                        setShowCategoryDropdown(false)
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="EXPENSE">Расход</option>
              <option value="INCOME">Доход</option>
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Сумма"
              value={amountCents}
              onChange={(event) => setAmountCents(event.target.value)}
            />

            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="BYN">BYN</option>
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
            </select>

            <input
              type="text"
              placeholder="Заметка"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />

            <button type="submit">Создать транзакцию</button>

            {createErrorMessage && (
              <p className="error-text">{createErrorMessage}</p>
            )}
          </form>

          {transactions.length === 0 ? (
            <p>Транзакций пока нет</p>
          ) : (
            <div className="menu">
              {transactions.map((transaction) => {
                const transactionType = getTransactionType(transaction)
                const isSelected = selectedTransaction?.id === transaction.id

                return (
                  <div
                    key={transaction.id}
                    className={`category-card ${isSelected ? 'selected-card' : ''}`}
                    onClick={() => openDeleteModal(transaction)}
                  >
                    <p
                      className={
                        transactionType === 'INCOME'
                          ? 'transaction-type income'
                          : 'transaction-type expense'
                      }
                    >
                      {transactionType === 'INCOME' ? 'Доход' : 'Расход'}
                    </p>

                    <p><strong>Категория:</strong> {getCategoryName(transaction.categoryId)}</p>
                    <p><strong>Сумма:</strong> {(transaction.amountCents / 100).toFixed(2)} {transaction.currency}</p>
                    <p><strong>Валюта:</strong> {transaction.currency}</p>
                    <p><strong>Дата:</strong> {formatDate(transaction.occurredAt)}</p>
                    {transaction.note && (
                      <p><strong>Заметка:</strong> {transaction.note}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {showDeleteModal && selectedTransaction && (
            <div className="modal-overlay" onClick={closeDeleteModal}>
              <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                <h3>Удалить транзакцию?</h3>
                <p><strong>Категория:</strong> {getCategoryName(selectedTransaction.categoryId)}</p>
                <p><strong>Сумма:</strong> {(selectedTransaction.amountCents / 100).toFixed(2)} {selectedTransaction.currency}</p>
                <p><strong>Дата:</strong> {formatDate(selectedTransaction.occurredAt)}</p>

                {deleteErrorMessage && (
                  <p className="error-text">{deleteErrorMessage}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="danger-button"
                    onClick={handleDeleteTransaction}
                  >
                    Удалить
                  </button>

                  <button
                    type="button"
                    onClick={closeDeleteModal}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="menu">
        <Link className="nav-button" to="/">Назад</Link>
      </div>
    </div>
  )
}

function BalancePage() {
  const [currency, setCurrency] = useState('BYN')
  const [balanceData, setBalanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadBalance(selectedCurrency) {
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `/api/transactions/balance?currency=${selectedCurrency}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setErrorMessage(errorData?.message || 'Не удалось получить баланс')
        setLoading(false)
        return
      }

      const data = await response.json().catch(() => null)
      setBalanceData(data)
      setLoading(false)
    } catch (error) {
      console.error('request error:', error)
      setErrorMessage('Не удалось отправить запрос')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalance(currency)
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    loadBalance(currency)
  }

  return (
    <div className="container">
      <h1>Баланс</h1>

      <form className="menu" onSubmit={handleSubmit}>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        >
          <option value="BYN">BYN</option>
          <option value="USD">USD</option>
          <option value="RUB">RUB</option>
        </select>

        <button type="submit">Показать баланс</button>
      </form>

      {loading && <p>Загрузка...</p>}

      {!loading && errorMessage && (
        <p className="error-text">{errorMessage}</p>
      )}

      {!loading && !errorMessage && balanceData && (
        <div className="category-card">
          <p>
            <strong>Баланс:</strong> {(balanceData.amountCents / 100).toFixed(2)} {balanceData.currency}
          </p>
        </div>
      )}

      <div className="menu">
        <Link className="nav-button" to="/">Назад</Link>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        setIsAuthenticated(true)
        setLoading(false)
      } catch (error) {
        console.error('request error:', error)
        setIsAuthenticated(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <p>Проверка авторизации...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/categories"
          element={<Navigate to="/transactions" replace />}
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/balance"
          element={
            <ProtectedRoute>
              <BalancePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
