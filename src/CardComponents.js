import React, { memo } from 'react';
import { instanceOf } from 'prop-types';
import { Cookies } from 'react-cookie';
import { Buffer } from 'buffer';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Badge from 'react-bootstrap/Badge';
import { LoginFailedToast, DownloadFailedToast } from "./Toasts";
import ProgressBar from 'react-bootstrap/ProgressBar';

import { AuthService } from './AuthService';

// Memoized CourseCard component for better performance
const CourseCard = memo(({ course, isSelected, onToggle }) => (
    <div 
        className={`course-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onToggle(course.id)}
    >
        <Form.Check 
            className="course-card-checkbox"
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Handled by card click
        />
        <div className="course-card-title">{course.displayname}</div>
        <div className="course-card-subtitle">{course.shortname}</div>
    </div>
));

export class LoginCard extends React.Component { // Custom Card for Login
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) { // Props are inherited properties one could pass.
        super(props)
        const { cookies } = props;
        // Set the default state here
        this.state = {
            wentthruvalidationbefore: false,
            username: cookies.get("username") || null,
            password: null,
            backend: cookies.get("backend") || "https://lms.ssn.edu.in/",
            custombackend: (cookies.get("custombackend") && JSON.parse(cookies.get("custombackend"))) || false,
            borderstyle: "light",
            loginfailed: false,
            loginfailurereason: null,
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleBackendSelectorChange = this.handleBackendSelectorChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCustomBackendInput = this.handleCustomBackendInput.bind(this);
        this.setMoodleClient = this.setMoodleClient.bind(this);
    }

    setMoodleClient(client) {
        this.props.setMoodleClient(client);
    }
    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }
    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }
    handleBackendSelectorChange(event) {
        // Backend has changed, so we have to reset the
        // moodle client.
        this.props.setMoodleClient(null);
        if (event.target.value === "custom") {
            this.setState({ custombackend: true });
        }
        else { this.setState({ backend: event.target.value, custombackend: false }); }
    }

    handleCustomBackendInput(event) {
        this.setState({ backend: event.target.value });
    }
    async handleSubmit(event) {
        event.preventDefault();
        const { cookies } = this.props;
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({ wentthruvalidationbefore: false });
            event.preventDefault();
            event.stopPropagation();

        }
        else {
            this.props.setAwaitLogin(true);
            try {
                // Use AuthService for login
                const moodleclient = await AuthService.login(
                    this.state.username, 
                    this.state.password, 
                    this.state.backend
                );
                
                this.props.setAwaitLogin(false)
                this.setState({ borderstyle: "success", loginfailed: false, loginfailurereason: null });
                this.setMoodleClient(moodleclient);

                // Still save preferences in cookies for UI convenience
                let oneyearlater = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                cookies.set('username', this.state.username, { expires: oneyearlater });
                cookies.set('custombackend', this.state.custombackend, { expires: oneyearlater });
                cookies.set('backend', this.state.backend, { expires: oneyearlater });
            }
            catch (e) {
                this.setState({ borderstyle: "danger", loginfailurereason: e.message, loginfailed: true });
                this.setMoodleClient(null);
            }
            this.props.setAwaitLogin(false)
        }

        this.setState({ wentthruvalidationbefore: true })
    }

    render() {
        const { cookies } = this.props;
        return <Card className='login-card' border={this.state.borderstyle}>
            <Card.Header className="text-center">
                <h4 className="mb-0">Login to Moodle</h4>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={this.handleSubmit} noValidate validated={this.state.wentthruvalidationbefore}>

                    <Form.Group className="mb-3" controlId="moodleusernameform">
                        <FloatingLabel controlId="floatingUsername" label="Moodle Username">
                            <Form.Control type="text" placeholder="Moodle Username" defaultValue={this.state.username} onChange={this.handleUsernameChange} required />
                        </FloatingLabel>
                        <Form.Control.Feedback type="invalid">
                            Please choose a username.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="moodlepasswordform">
                        <FloatingLabel controlId="floatingPassword" label="Password">
                            <Form.Control type="password" placeholder="Password" onChange={this.handlePasswordChange} required />
                        </FloatingLabel>
                        <Form.Control.Feedback type="invalid">
                            Please enter your password.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="moodlebackendselectform">
                        <Form.Label>Moodle Backend:</Form.Label>
                        <Form.Select
                            aria-label="Moodle Backend Selector"
                            onChange={this.handleBackendSelectorChange}
                            defaultValue={this.state.custombackend ? "custom" : this.state.backend}
                            required>
                            <option value="https://lms.ssn.edu.in/">SSN College LMS</option>
                            <option value="https://lms-old.ssn.edu.in">SSN College LMS (old)</option>
                            <option value="https://lms.snuchennai.edu.in/">SNU Chennai LMS</option>
                            <option value="https://lms-old.snuchennai.edu.in">SNU Chennai LMS (old)</option>
                            <option value="custom">Custom Backend (Experimental!)</option>
                        </Form.Select>
                    </Form.Group>
                    {
                        this.state.custombackend &&
                        <Form.Group className="mb-3" controlId="moodlecustombackendform">
                            <Form.Control
                                type="url"
                                placeholder="https://school.moodledemo.net/"
                                defaultValue={cookies.get("custombackend") && JSON.parse(cookies.get("custombackend")) ? this.state.backend : undefined}
                                onChange={this.handleCustomBackendInput}
                                required={this.state.custombackend} />
                            <Form.Control.Feedback type="invalid">
                                Please enter a proper URL.
                            </Form.Control.Feedback>
                        </Form.Group>
                    }
                    <div className="d-grid">
                        <Button variant="primary" size="lg" type='submit'>
                            Log In
                        </Button>
                    </div>
                    <LoginFailedToast showToast={this.state.loginfailed} failureReason={this.state.loginfailurereason}></LoginFailedToast>
                </Form>
            </Card.Body>
        </Card>
    }
}

export class CourseSelectCard extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };
    constructor(props) {
        super(props);
        const { cookies } = props;
        this.state = {
            borderstyle: "light",
            wentthruvalidationbefore: false,
            courses: [],
            filteredCourses: [],
            searchTerm: "",
            selectedcoursesids: cookies.get("selectedcoursesids") ? JSON.parse(Buffer.from(cookies.get("selectedcoursesids"), "base64").toString('utf-8')) : [],
            downloadfailed: false,
            downloadfailurereason: null,
            downloadProgress: 0,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.toggleCourseSelection = this.toggleCourseSelection.bind(this);
        this.selectAllFiltered = this.selectAllFiltered.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
    }

    updateProgress(progress) {
        this.setState({ downloadProgress: progress });
    }

    async componentDidMount() {
        this.props.setLoading(true)
        await this.props.moodleclient.getUserID();
        const courses = await this.props.moodleclient.getUserCourses();
        this.setState({ courses, filteredCourses: courses })
        this.props.setLoading(false)
    }

    handleSearchChange(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredCourses = this.state.courses.filter(course => 
            course.displayname.toLowerCase().includes(searchTerm) ||
            course.shortname.toLowerCase().includes(searchTerm) ||
            course.fullname.toLowerCase().includes(searchTerm)
        );
        this.setState({ searchTerm, filteredCourses });
    }

    toggleCourseSelection(courseId) {
        const { selectedcoursesids } = this.state;
        const courseIdStr = courseId.toString();
        const newSelection = selectedcoursesids.includes(courseIdStr)
            ? selectedcoursesids.filter(id => id !== courseIdStr)
            : [...selectedcoursesids, courseIdStr];
        this.setState({ selectedcoursesids: newSelection });
    }

    selectAllFiltered() {
        const filteredIds = this.state.filteredCourses.map(course => course.id.toString());
        const newSelection = [...new Set([...this.state.selectedcoursesids, ...filteredIds])];
        this.setState({ selectedcoursesids: newSelection });
    }

    clearSelection() {
        this.setState({ selectedcoursesids: [] });
    }

    async handleSubmit(event) {
        event.preventDefault();
        const { cookies } = this.props;
        
        this.setState({ downloadfailed: false, downloadfailurereason: null, borderstyle: "light", downloadProgress: 0 })
        this.props.setLoading(true)
        try {
            const selectedCourses = this.state.courses.filter(course => this.state.selectedcoursesids.includes(course["id"].toString()));
            await this.props.moodleclient.getFilesForDownload(selectedCourses);
            let oneyearlater = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            let encodedString = Buffer.from(JSON.stringify(this.state.selectedcoursesids)).toString('base64');
            cookies.set('selectedcoursesids', encodedString, { expires: oneyearlater });
            
            // Create filename with course names/IDs
            const courseNames = selectedCourses.map(course => course.shortname).join('_');
            const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const filename = `${courseNames}_${timestamp}.zip`;
            
            await this.props.moodleclient.downloadFilesIntoZIP(this.updateProgress, filename);
        }
        catch (e) {
            console.log(e);
            this.setState({ borderstyle: "danger", downloadfailurereason: e.message, downloadfailed: true });
        }
        finally {
            this.props.setLoading(false);
            this.setState({ downloadProgress: 0 });
        }
    }

    render() {
        const { filteredCourses, selectedcoursesids, searchTerm, downloadProgress } = this.state;
        const selectedCount = selectedcoursesids.length;
        
        return <Card className='course-select-card' border={this.state.borderstyle}>
            <Card.Body>
                <div className="search-container mb-4">
                    <Form.Control
                        className="search-input"
                        type="text"
                        placeholder="Search courses (e.g., UCS2502, Microprocessors, CSE, Section B)"
                        value={searchTerm}
                        onChange={this.handleSearchChange}
                    />
                </div>
                
                <div className="selection-controls">
                    <div className="selection-info">
                        <Badge bg="primary" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
                            {selectedCount} course{selectedCount !== 1 ? 's' : ''} selected
                        </Badge>
                    </div>
                    <div className="selection-buttons">
                        <Button variant="outline-primary" size="sm" onClick={this.selectAllFiltered}>
                            Select All Filtered ({filteredCourses.length})
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={this.clearSelection}>
                            Clear All
                        </Button>
                    </div>
                </div>

                <div className="courses-grid">
                    {filteredCourses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isSelected={selectedcoursesids.includes(course.id.toString())}
                            onToggle={this.toggleCourseSelection}
                        />
                    ))}
                </div>

                {filteredCourses.length === 0 && searchTerm && (
                    <div className="text-center py-5">
                        <h5 className="text-muted">No courses found matching "{searchTerm}"</h5>
                        <p className="text-muted">Try adjusting your search terms</p>
                    </div>
                )}

                <div className="download-section text-center">
                    <Form onSubmit={this.handleSubmit}>
                        <Button 
                            className="download-button" 
                            type='submit' 
                            disabled={selectedcoursesids.length <= 0}
                        >
                            Download {selectedCount} Course{selectedCount !== 1 ? 's' : ''}
                        </Button>
                    </Form>
                    
                    {downloadProgress > 0 && (
                        <div className="mt-3">
                            <ProgressBar 
                                now={downloadProgress} 
                                label={`${Math.round(downloadProgress)}%`}
                                style={{height: '8px'}}
                            />
                        </div>
                    )}
                </div>
            </Card.Body>
            <DownloadFailedToast showToast={this.state.downloadfailed} failureReason={this.state.downloadfailurereason}></DownloadFailedToast>
        </Card>
    }
}
