import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProgramsPage from './pages/ProgramsPage'
import CoursesPage from './pages/CoursesPage'
import AcademicTermsPage from './pages/AcademicTermsPage'
import CourseOfferingsPage from './pages/CourseOfferingsPage'
import StudentsPage from './pages/StudentsPage'
import EnrollmentsPage from './pages/EnrollmentPage'
import AcademicRecordPage from './pages/AcademicRecordPage'
import ProfilePage from './pages/ProfilePage'
import CourseOfferingStudentsPage from './pages/CourseOfferingStudentsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout/>}>
          <Route path="/" element={<DashboardPage />} />
          {/* Dashboard */}
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/academic-terms" element={<AcademicTermsPage />} />
          <Route path="/course-offerings" element={<CourseOfferingsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/enrollments" element={<EnrollmentsPage />} />
          <Route path="/academic-record" element={<AcademicRecordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/course-offerings/:id/students" element={<CourseOfferingStudentsPage />} />
        </Route>  {/*AppLayout*/}
      </Route> {/*ProtectedRoute*/}
    </Routes>
  )
}

export default App