import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import DashboardLayout from '../components/DashboardLayout'
import { MailIcon } from '../components/Icons'
import './SettingsPage.css'

export default function SettingsPage() {
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  
  // Մեծ լուսանկարի հասցեն (նույնականացված header-ի հետ)
  const avatarUrl = '/assets/avatar-small.png' 
  
  const [oldPassword, setOldPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')

  const [profileLoading, setProfileLoading] = useState<boolean>(false)
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name
        if (fullName) {
          const parts = fullName.split(' ')
          setFirstName(parts[0] || '')
          setLastName(parts.slice(1).join(' ') || '')
        }
      }
    }
    fetchUserData()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) {
      alert('Անուն դաշտը չի կարող դատարկ լինել։')
      return
    }

    setProfileLoading(true)
    const fullCombinedName = `${firstName.trim()} ${lastName.trim()}`

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullCombinedName }
    })

    setProfileLoading(false)

    if (error) {
      alert('Պրոֆիլի թարմացման սխալ: ' + error.message)
    } else {
      alert('Տվյալները հաջողությամբ պահպանվեցին։')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!oldPassword) {
      alert('Խնդրում ենք լրացնել հին գաղտնաբառը։')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      alert('Նոր գաղտնաբառը պետք է լինի առնվազն 6 նիշ։')
      return
    }

    setPasswordLoading(true)

    // ՀԻՆ ԳԱՂՏՆԱԲԱՌԻ ԻՐԱԿԱՆ ՍՏՈՒԳՈՒՄ
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: oldPassword,
    })

    if (signInError) {
      setPasswordLoading(false)
      alert('Հին գաղտնաբառը սխալ է մուտքագրված: Փոփոխությունը մերժվեց:')
      return
    }

    // ՆՈՐ ԳԱՂՏՆԱԲԱՌԻ ԹԱՐՄԱՑՈՒՄ
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    setPasswordLoading(false)

    if (updateError) {
      alert('Գաղտնաբառի փոփոխման սխալ: ' + updateError.message)
    } else {
      alert('Գաղտնաբառը հաջողությամբ փոխվեց։')
      setOldPassword('')
      setNewPassword('')
    }
  }

  return (
    <DashboardLayout active="settings">
      <div className="dash-card settings-card">
        <div className="dash-card__banner" />

        {/* Գլխավոր պրոֆիլի նկարի հատվածը */}
        <div className="settings-card__profile">
          <img src={avatarUrl} alt="User Avatar" className="settings-card__avatar" />
          <div>
            <h2 className="settings-card__name">
              {firstName ? `${firstName} ${lastName}` : 'User Profile'}
            </h2>
            <p className="settings-card__email">{email}</p>
          </div>
        </div>

        <div className="settings-card__form">
          <form onSubmit={handleSaveProfile} style={{ marginBottom: '40px' }}>
            <div className="settings-card__row">
              <div className="settings-field">
                <label htmlFor="firstName">First Name</label>
                <input 
                  id="firstName" 
                  type="text" 
                  placeholder="Your First Name" 
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  id="lastName" 
                  type="text" 
                  placeholder="Your Last Name" 
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <button type="submit" className="settings-password__btn" disabled={profileLoading} style={{ float: 'right', marginBottom: '20px' }}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <div style={{ clear: 'both' }}></div>
          </form>

          <div className="settings-card__bottom">
            <div className="settings-email">
              <h3>My email Address</h3>
              <div className="settings-email__item">
                <span className="settings-email__icon">
                  <MailIcon />
                </span>
                <div>
                  <p className="settings-email__address">{email}</p>
                  <p className="settings-email__time">Active Account</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="settings-password">
              <div className="settings-field">
                <label htmlFor="oldPassword">Old Password</label>
                <input 
                  id="oldPassword" 
                  type="password" 
                  placeholder="••••••••••••"
                  value={oldPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  id="newPassword" 
                  type="password" 
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="settings-password__btn" disabled={passwordLoading}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}