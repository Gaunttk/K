import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Step1Restaurant from '../components/visit/steps/Step1Restaurant'
import Step2Basics from '../components/visit/steps/Step2Basics'
import Step3Ratings from '../components/visit/steps/Step3Ratings'
import Step4Sides from '../components/visit/steps/Step4Sides'
import Step5Sauces from '../components/visit/steps/Step5Sauces'
import Step6Photos from '../components/visit/steps/Step6Photos'
import Step7Review from '../components/visit/steps/Step7Review'
import type { VisitFormData, PhotoLabel } from '../types'

const DRAFT_KEY = 'jgq_draft_visit'

const PHOTO_LABELS: PhotoLabel[] = ['Full Meal', 'Exterior', 'Interior']

function emptyForm(): VisitFormData {
  return {
    restaurant: null,
    newRestaurant: null,
    visitDate: new Date().toISOString().split('T')[0],
    meatTypes: [],
    ratings: { value: null, quantity: null, atmosphere: null, staff: null, overall: null },
    sides: [],
    sauces: [],
    photos: PHOTO_LABELS.map((label) => ({
      label,
      file: null,
      compressedFile: null,
      preview: null,
      uploadState: 'idle' as const,
    })) as unknown as VisitFormData['photos'],
    comments: '',
  }
}

const STEP_TITLES = [
  'Restaurant',
  'Basics',
  'Ratings',
  'Sides',
  'Sauces',
  'Photos',
  'Review',
]

export default function NewVisitPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<VisitFormData>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as VisitFormData
        // Reset File objects (non-serializable)
        parsed.photos = PHOTO_LABELS.map((label) => ({
          label,
          file: null,
          compressedFile: null,
          preview: null,
          uploadState: 'idle' as const,
        })) as VisitFormData['photos']
        return parsed
      }
    } catch { /* ignore */ }
    return emptyForm()
  })

  // Save draft on change (excluding File objects)
  useEffect(() => {
    try {
      const serializable = {
        ...data,
        photos: data.photos.map(({ label }) => ({
          label,
          file: null,
          compressedFile: null,
          preview: null,
          uploadState: 'idle' as const,
        })),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable))
    } catch { /* ignore */ }
  }, [data])

  function handleSubmitSuccess() {
    localStorage.removeItem(DRAFT_KEY)
  }

  function handleAbandon() {
    if (window.confirm('Discard this visit?')) {
      localStorage.removeItem(DRAFT_KEY)
      navigate('/home')
    }
  }

  const totalSteps = STEP_TITLES.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-text">Log Visit</h1>
        <button
          type="button"
          onClick={handleAbandon}
          className="text-sm text-text-muted hover:text-error transition-colors"
        >
          Discard
        </button>
      </div>

      {/* Step progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="font-heading tracking-wider">{STEP_TITLES[step]}</span>
          <span>{step + 1} / {totalSteps}</span>
        </div>
        <div className="flex gap-1">
          {STEP_TITLES.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < step ? 'bg-amber' : i === step ? 'bg-accent-red' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 0 && <Step1Restaurant data={data} onChange={setData} onNext={() => setStep(1)} />}
      {step === 1 && <Step2Basics data={data} onChange={setData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <Step3Ratings data={data} onChange={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step4Sides data={data} onChange={setData} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <Step5Sauces data={data} onChange={setData} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <Step6Photos data={data} onChange={setData} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
      {step === 6 && <Step7Review data={data} onChange={setData} onBack={() => setStep(5)} onSubmitSuccess={handleSubmitSuccess} />}
    </div>
  )
}
