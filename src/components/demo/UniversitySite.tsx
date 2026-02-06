import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SimulatedSiteProps } from '@/lib/types';
import { BookOpen, FileText, Upload, ChevronRight } from 'lucide-react';

const courses = [
  { id: 'cs101', name: 'Introduction to Computer Science', code: 'CS 101' },
  { id: 'math201', name: 'Linear Algebra', code: 'MATH 201' },
  { id: 'eng102', name: 'Academic Writing', code: 'ENG 102' },
];

const assignments = [
  { id: 'hw1', name: 'Homework 1: Variables', dueDate: 'Feb 15, 2026', status: 'pending' },
  { id: 'hw2', name: 'Homework 2: Loops', dueDate: 'Feb 22, 2026', status: 'submitted' },
  { id: 'project', name: 'Final Project Proposal', dueDate: 'Mar 1, 2026', status: 'pending' },
];

export function UniversitySite({ onAction, currentStep, isCalm, isFocusAssist }: SimulatedSiteProps) {
  const [view, setView] = useState<'home' | 'courses' | 'course' | 'assignment' | 'complete'>('home');
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<typeof assignments[0] | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [comment, setComment] = useState('');

  const isTarget = (selector: string) => currentStep?.targetSelector === `[data-navai="${selector}"]`;

  return (
    <div className="min-h-full bg-background">
      {/* University header */}
      <header className="bg-secondary border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">🎓</div>
              <div>
                <h1 className="font-bold text-lg">State University Portal</h1>
                <p className="text-xs text-muted-foreground">Welcome back, Student</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 text-sm ${isCalm ? 'navai-distraction' : ''}`}>
              <span className="text-muted-foreground cursor-pointer hover:text-foreground">Messages (3)</span>
              <span className="text-muted-foreground cursor-pointer hover:text-foreground">Calendar</span>
              <span className="text-muted-foreground cursor-pointer hover:text-foreground">Grades</span>
              <div className="w-8 h-8 bg-muted rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Navigation bar */}
        <div className="px-6 py-2 flex gap-4 text-sm border-t border-border/50">
          <span 
            className="text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => setView('home')}
          >
            Dashboard
          </span>
          <span 
            data-navai="my-courses"
            className={`cursor-pointer ${
              isTarget('my-courses') 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              setView('courses');
              onAction('[data-navai="my-courses"]', true);
            }}
          >
            My Courses
          </span>
          <span className={`text-muted-foreground cursor-pointer hover:text-foreground ${isCalm ? 'navai-distraction' : ''}`}>Library</span>
          <span className={`text-muted-foreground cursor-pointer hover:text-foreground ${isCalm ? 'navai-distraction' : ''}`}>Resources</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {!isFocusAssist && (
          <aside className={`hidden lg:block w-56 shrink-0 p-4 border-r border-border ${isCalm ? 'navai-distraction' : ''}`}>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Announcements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="cursor-pointer hover:text-foreground">Campus closed Monday</li>
                  <li className="cursor-pointer hover:text-foreground">New library hours</li>
                  <li className="cursor-pointer hover:text-foreground">Registration opens</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">Upcoming Deadlines</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>CS 101 HW - Feb 15</li>
                  <li>MATH 201 Quiz - Feb 18</li>
                  <li>ENG 102 Essay - Feb 20</li>
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Home view */}
          {view === 'home' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Courses</span>
                  </div>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pending Assignments</span>
                  </div>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Current GPA</span>
                  </div>
                  <p className="text-2xl font-bold">3.7</p>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Click on "My Courses" to view your enrolled courses and submit assignments.
              </p>
            </div>
          )}

          {/* Courses list */}
          {view === 'courses' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">My Courses</h2>
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    data-navai={index === 0 ? 'course-item' : undefined}
                    className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors hover:bg-secondary ${
                      isTarget('course-item') && index === 0 
                        ? 'ring-2 ring-primary' 
                        : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedCourse(course);
                      setView('course');
                      if (index === 0) {
                        onAction('[data-navai="course-item"]', true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">{course.code}</span>
                        <h3 className="font-medium">{course.name}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course detail */}
          {view === 'course' && selectedCourse && (
            <div>
              <button 
                onClick={() => setView('courses')}
                className={`text-sm text-muted-foreground hover:text-foreground mb-4 ${isCalm ? 'navai-distraction' : ''}`}
              >
                ← Back to courses
              </button>
              
              <h2 className="text-xl font-semibold mb-2">{selectedCourse.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{selectedCourse.code}</p>
              
              <h3 className="font-medium mb-4">Assignments</h3>
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    data-navai={index === 0 ? 'assignment-item' : undefined}
                    className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors hover:bg-secondary ${
                      isTarget('assignment-item') && index === 0 
                        ? 'ring-2 ring-primary' 
                        : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setView('assignment');
                      if (index === 0) {
                        onAction('[data-navai="assignment-item"]', true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{assignment.name}</h4>
                        <span className="text-xs text-muted-foreground">Due: {assignment.dueDate}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        assignment.status === 'submitted' 
                          ? 'bg-primary/20 text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment submission */}
          {view === 'assignment' && selectedAssignment && (
            <div>
              <button 
                onClick={() => setView('course')}
                className={`text-sm text-muted-foreground hover:text-foreground mb-4 ${isCalm ? 'navai-distraction' : ''}`}
              >
                ← Back to assignments
              </button>
              
              <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
                <h2 className="text-xl font-semibold mb-2">{selectedAssignment.name}</h2>
                <p className="text-sm text-muted-foreground mb-6">Due: {selectedAssignment.dueDate}</p>
                
                <div className="space-y-6">
                  <div>
                    <Label>Upload Your Submission</Label>
                    <div 
                      data-navai="upload-assignment"
                      className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-secondary/50 transition-colors ${
                        isTarget('upload-assignment') ? 'border-primary bg-primary/5' : 'border-border'
                      } ${fileUploaded ? 'bg-primary/10' : ''}`}
                      onClick={() => {
                        setFileUploaded(true);
                        onAction('[data-navai="upload-assignment"]', true);
                      }}
                    >
                      {fileUploaded ? (
                        <p className="text-primary font-medium">✓ File uploaded: homework1.pdf</p>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground mb-1">Click to upload your file</p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Comments (optional)</Label>
                    <Textarea
                      id="comment"
                      data-navai="assignment-comment"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        onAction('[data-navai="assignment-comment"]', true);
                      }}
                      placeholder="Add a note for your instructor..."
                      className={`mt-2 ${isTarget('assignment-comment') ? 'ring-2 ring-primary' : ''}`}
                    />
                  </div>

                  <Button
                    data-navai="submit-assignment"
                    className="btn-pill-primary w-full"
                    disabled={!fileUploaded}
                    onClick={() => {
                      setView('complete');
                      onAction('[data-navai="submit-assignment"]', true);
                    }}
                  >
                    Submit Assignment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Complete */}
          {view === 'complete' && (
            <div className="bg-card border border-border rounded-xl p-8 text-center max-w-xl">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold mb-2">Assignment Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your submission for "{selectedAssignment?.name}" has been received.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setView('courses');
                  setSelectedCourse(null);
                  setSelectedAssignment(null);
                  setFileUploaded(false);
                  setComment('');
                }}
              >
                Return to Courses
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
