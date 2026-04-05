import React from 'react'
import ApplicationFormPage from '../components/ApplicationFormPage'

function VolunteerRolesIntro() {
  const [roles, setRoles] = React.useState([])

  React.useEffect(() => {
    let isMounted = true
    fetch('/api/ops/roles')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return
        setRoles(Array.isArray(data?.roles) ? data.roles.filter((item) => item.openSlots > 0) : [])
      })
      .catch(() => {
        if (!isMounted) return
        setRoles([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="mt-5 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 text-[#f7f1e8]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">open volunteer roles</p>
      {roles.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#f7f1e8]/82">
          {roles.map((role) => (
            <li key={`${role.role}-${role.area}-${role.shiftDate}-${role.shiftStart}`}>
              <strong className="text-[#f7f1e8]">{role.role}</strong>
              {role.area ? ` · ${role.area}` : ''}
              {role.shiftDate ? ` · ${role.shiftDate}` : ''}
              {role.shiftStart ? ` ${role.shiftStart}` : ''}
              {role.openSlots ? ` · ${role.openSlots} open` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/76">Fill this out anyway. If the listed roles are stale, you can still choose the closest fit and sort details with the organizers after.</p>
      )}
    </div>
  )
}

export default function VolunteerApplicationPage() {
  return (
    <ApplicationFormPage
      type="volunteer"
      title="volunteer application"
      intro="Pick the role you want, tell us when you are free, and we will get your information into the ops board instead of losing it in somebody's notes app."
      extraIntro={<VolunteerRolesIntro />}
      successTitle="volunteer application submitted"
      successBody="We saved your volunteer application. If plans shift, follow up at maydayontheharbor@proton.me so the staffing board does not become folklore."
    />
  )
}
