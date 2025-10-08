import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './EventFormModal.module.css';
import './CustomDateTimePicker.css';
import formStyles from './EventCreationForm.module.css';

import ToggleSwitch from '../ToggleSwitch';
import ImageDropzone from '../ImageDropzone/ImageDropzone';
import { getAuthHeader } from '../../utils/auth';
import useAllEventsStore from '../../store/allEventsStore';
import { useAuth } from '../../context/AuthContext';

const EventFormModal = ({ event, dateStr, onClose }) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date(),
    location: '',
    price: 0,
    capacity: 0,
    tags: '',
    imageUrl: ''
  });
  const [useLink, setUseLink] = useState(true);
  const [error, setError] = useState('');

  const { addEvent, updateEvent, deleteEvent } = useAllEventsStore.getState();

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : new Date(),
        location: event.location || '',
        price: event.price || 0,
        capacity: event.capacity || 0,
        tags: event.tags || '',
        imageUrl: event.imageUrl || ''
      });
      setUseLink(!!event.imageUrl);
    } else if (dateStr) {
      setFormData(prev => ({ ...prev, date: new Date(dateStr) }));
    }
  }, [event, dateStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleImageDrop = (base64) => {
    setFormData(prev => ({ ...prev, imageUrl: base64 }));
  };

  const handleImageLinkChange = (e) => {
    setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
  };

  const handleSave = async () => {
    setError('');
    if (!formData.name || !formData.location || !formData.capacity) {
        setError('Event Name, Location, and Capacity are required.');
        return;
    }

    const isEdit = !!event;
    const userRole = userProfile?.role;

    try {
        if (isEdit) {
            await updateEvent({ ...event, ...formData }, user);
        } else {
            await addEvent(formData, user);
        }
        onClose();
    } catch (err) {
        console.error('Failed to save event:', err);
        setError(err.message || 'An error occurred while saving.');
    }
  };

  const handleDelete = async () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
        try {
            await deleteEvent(event.id, user);
            onClose();
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError(err.message || 'An error occurred while deleting.');
        }
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modalContent} ${formStyles.glassmorphismContainer}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onClose} className={styles.closeModalBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <form className={formStyles.formGrid} onSubmit={(e) => e.preventDefault()}>
            {/* Column 1 */}
            <div className={formStyles.formColumn}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="name">Event Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} maxLength="50" placeholder="Enter event name" />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="date">Event Date & Time</label>
                <DatePicker selected={formData.date} onChange={handleDateChange} showTimeSelect minDate={new Date()} dateFormat="MMMM d, yyyy h:mm aa" className={formStyles.datePicker} />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Online or Venue Name" />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., Tech, Music, Workshop" />
              </div>
            </div>

            {/* Column 2 */}
            <div className={formStyles.formColumn}>
                <div className={formStyles.inputGroup}>
                    <label>Thumbnail</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Upload</span>
                    <ToggleSwitch isOn={useLink} handleToggle={() => setUseLink(!useLink)} />
                    <span>Link</span>
                    </div>
                </div>
                {useLink ? (
                    <div className={formStyles.inputGroup}>
                    <label htmlFor="imageUrl">Image Link</label>
                    <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleImageLinkChange} placeholder="Enter image URL" />
                    </div>
                ) : (
                    <ImageDropzone onDrop={handleImageDrop} thumbnail={formData.imageUrl} />
                )}
                <div className={formStyles.inputGroup} style={{flexDirection: 'row', gap: '1rem'}}>
                    <div>
                        <label htmlFor="price">Price (INR)</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" />
                    </div>
                    <div>
                        <label htmlFor="capacity">Capacity</label>
                        <input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} min="0" />
                    </div>
                </div>
            </div>

            {/* Full Width Description */}
            <div className={`${formStyles.inputGroup} ${formStyles.fullWidth}`}>
              <label htmlFor="description">Event Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} maxLength="2500" placeholder="Enter event description" rows="6" />
            </div>
          </form>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
        <div className={styles.modalFooter}>
            {event && <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>}
            <button onClick={handleSave} className={styles.saveBtn}>{event ? 'Save Changes' : 'Create Event'}</button>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
